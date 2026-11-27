import { MAX_CALC_BYTES, SHARE_ID } from "../../js/shared_calc_payload.mjs";

export const MAX_DAILY_UPLOADS = 100;
export const MAX_DAILY_BYTES = 100_000_000;
export const MAX_STORED_BYTES = 5_000_000_000;

const utcDay = () => new Date().toISOString().slice(0, 10);
const noCapacity = (status, error) => ({ status, body: { error } });

async function digest(bytes) {
    return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
        byte => byte.toString(16).padStart(2, "0")).join("");
}

export class PublishQuotaLedger {
    constructor(storage, bucket) {
        this.storage = storage;
        this.sql = storage.sql;
        this.bucket = bucket;
        this.inFlight = new Map();
        this.sql.exec(`
            CREATE TABLE IF NOT EXISTS quota (
                singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
                day TEXT NOT NULL,
                daily_uploads INTEGER NOT NULL,
                daily_bytes INTEGER NOT NULL,
                total_bytes INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS publications (
                hash TEXT PRIMARY KEY,
                id TEXT NOT NULL UNIQUE,
                day TEXT NOT NULL,
                committed INTEGER NOT NULL
            );
        `);
    }

    async inventoryExistingObjects() {
        const legacyHashes = new Map();
        const daily = new Map();
        let totalBytes = 0;
        let cursor;
        do {
            const page = await this.bucket.list({ cursor });
            for (const object of page.objects) {
                totalBytes += object.size;
                if (!SHARE_ID.test(object.key) || object.size > MAX_CALC_BYTES) continue;
                const day = object.uploaded.toISOString().slice(0, 10);
                const count = daily.get(day) || { uploads: 0, bytes: 0 };
                count.uploads++;
                count.bytes += object.size;
                daily.set(day, count);
                const content = await this.bucket.get(object.key);
                if (!content) throw new Error("Share changed during quota inventory");
                const hash = await digest(await content.arrayBuffer());
                if (!legacyHashes.has(hash)) legacyHashes.set(hash, { id: object.key, day });
            }
            cursor = page.truncated ? page.cursor : undefined;
        } while (cursor);

        const day = utcDay();
        const count = daily.get(day) || { uploads: 0, bytes: 0 };
        this.storage.transactionSync(() => {
            for (const [hash, { id, day: publishedDay }] of legacyHashes) {
                this.sql.exec("INSERT INTO publications VALUES (?, ?, ?, 1)", hash, id, publishedDay);
            }
            this.sql.exec("INSERT INTO quota VALUES (1, ?, ?, ?, ?)", day, count.uploads, count.bytes, totalBytes);
        });
    }

    async ensureInventory() {
        if (this.sql.exec("SELECT 1 FROM quota").toArray().length) return;
        this.inventory ||= this.inventoryExistingObjects().finally(() => { this.inventory = null; });
        await this.inventory;
    }

    reserve(hash, size) {
        return this.storage.transactionSync(() => {
            const existing = this.sql.exec("SELECT id, day, committed FROM publications WHERE hash = ?", hash).toArray()[0];
            if (existing?.committed) return { id: existing.id, duplicate: true };

            const day = utcDay();
            const quota = this.sql.exec("SELECT * FROM quota WHERE singleton = 1").one();
            const sameDay = quota.day === day;
            const uploads = sameDay ? quota.daily_uploads : 0;
            const bytes = sameDay ? quota.daily_bytes : 0;
            const chargeToday = existing?.day !== day;
            if (chargeToday && (uploads >= MAX_DAILY_UPLOADS || bytes + size > MAX_DAILY_BYTES)) {
                return noCapacity(429, "The daily publishing limit has been reached. Try again after midnight UTC.");
            }
            if (!existing && quota.total_bytes + size > MAX_STORED_BYTES) {
                return noCapacity(507, "Shared calc storage is full. Existing share links still work.");
            }

            const id = existing?.id || crypto.randomUUID().replaceAll("-", "");
            this.sql.exec(`UPDATE quota SET day = ?, daily_uploads = ?, daily_bytes = ?,
                total_bytes = ? WHERE singleton = 1`, day, uploads + Number(chargeToday),
                bytes + (chargeToday ? size : 0), quota.total_bytes + (existing ? 0 : size));
            if (existing) this.sql.exec("UPDATE publications SET day = ? WHERE hash = ?", day, hash);
            else this.sql.exec("INSERT INTO publications VALUES (?, ?, ?, 0)", hash, id, day);
            return { id };
        });
    }

    async write(hash, bytes) {
        const reserved = this.reserve(hash, bytes.byteLength);
        if (reserved.status) return reserved;
        const { id, duplicate } = reserved;
        if (duplicate) {
            if (!await this.bucket.head(id)) return noCapacity(410, "This shared calc was removed.");
            return { status: 200, body: { id } };
        }

        // A failed or interrupted write keeps its reservation and ID. Retrying
        // the same bytes can recover it without creating a second object.
        const object = await this.bucket.put(id, bytes, {
            onlyIf: new Headers({ "If-None-Match": "*" }),
            httpMetadata: { contentType: "application/json" },
            customMetadata: { sha256: hash }
        });
        if (!object && (await this.bucket.head(id))?.customMetadata?.sha256 !== hash) {
            throw new Error("Reserved share ID is already occupied");
        }
        this.sql.exec("UPDATE publications SET committed = 1 WHERE hash = ?", hash);
        return { status: object ? 201 : 200, body: { id } };
    }

    async publish(bytes) {
        await this.ensureInventory();
        const hash = await digest(bytes);
        const pending = this.inFlight.get(hash);
        if (pending) {
            const result = await pending;
            return result.status === 201 ? { ...result, status: 200 } : result;
        }
        const operation = this.write(hash, bytes);
        this.inFlight.set(hash, operation);
        try {
            return await operation;
        } finally {
            this.inFlight.delete(hash);
        }
    }
}
