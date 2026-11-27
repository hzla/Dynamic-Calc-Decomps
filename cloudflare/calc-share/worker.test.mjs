import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import worker from "./worker.mjs";
import { MAX_CALC_BYTES, parseSharedCalc, serializeBridgedCalc } from "../../js/shared_calc_payload.mjs";
import { MAX_DAILY_BYTES, MAX_STORED_BYTES, PublishQuotaLedger } from "./publish-quota.mjs";

const origin = "https://hzla.github.io";
const text = JSON.stringify({
    title: "Community Test",
    formatted_sets: { Pikachu: { "Lvl 5 Trainer": { level: 5, moves: ["Thunder Shock"] } } },
    poks: {}, moves: {}
});

function environment() {
    const objects = new Map();
    const rate = { limit: async () => ({ success: true }) };
    const db = new DatabaseSync(":memory:");
    const storage = {
        sql: {
            exec(query, ...bindings) {
                if (query.trimStart().startsWith("CREATE TABLE")) {
                    db.exec(query);
                    return;
                }
                const rows = db.prepare(query).all(...bindings);
                return { toArray: () => rows, one: () => rows[0] };
            }
        },
        transactionSync(fn) {
            db.exec("BEGIN");
            try {
                const result = fn();
                db.exec("COMMIT");
                return result;
            } catch (error) {
                db.exec("ROLLBACK");
                throw error;
            }
        }
    };
    const bucket = {
        async put(key, bytes, options) {
            if (objects.has(key)) return null;
            const object = { key, size: bytes.byteLength, uploaded: new Date(), customMetadata: options.customMetadata,
                body: bytes, arrayBuffer: async () => bytes };
            objects.set(key, object);
            return object;
        },
        head: async id => objects.get(id) || null,
        get: async id => objects.get(id) || null,
        list: async () => ({ objects: [...objects.values()], truncated: false })
    };
    const ledger = new PublishQuotaLedger(storage, bucket);
    return {
        objects,
        db, storage, ledger,
        UPLOADS_ENABLED: "true",
        ALLOWED_ORIGINS: origin,
        TURNSTILE_SECRET: "test-secret",
        TURNSTILE_SITE_KEY: "test-key",
        UPLOAD_LIMIT: rate,
        TOTAL_UPLOAD_LIMIT: rate,
        PUBLISH_QUOTA: { getByName: () => ledger },
        CALCS: bucket
    };
}

function upload(env, body, headers = {}) {
    return worker.fetch(new Request("https://worker.test/calcs", {
        method: "POST", body, duplex: "half",
        headers: { Origin: origin, "Content-Type": "application/json", "X-Turnstile-Token": "test-token", ...headers }
    }), env);
}

test("validates plain calc JSON without accepting markup or reserved object keys", () => {
    assert.equal(parseSharedCalc(text).title, "Community Test");
    assert.throws(() => parseSharedCalc("backup_data = " + text), /valid JSON/);
    assert.throws(() => parseSharedCalc(text.replace("Community Test", "\\u003cimg src=x>")), /plain text/);
    assert.throws(() => parseSharedCalc(text.replace('"poks":{}', '"poks":{"__proto__":{}}')), /reserved key/);
    assert.throws(() => parseSharedCalc(text.replace('"poks":{}', '"poks":{},"pokewebBattleRules":{}')), /expanded Pokeweb/);
    assert.throws(() => parseSharedCalc(text.replace('["Thunder Shock"]', '[21]')), /moves list/);
});

test("serializes the bridge export without raw ROM metadata and preserves expanded Pokeweb rules", () => {
    const data = {
        ...JSON.parse(text),
        _meta: { raw: '<not published>' },
        trainers: {},
        pokewebBattleRules: { version: 1, baseGame: "BW2", items: [], abilities: [], moves: [], moveData: [] }
    };
    const published = parseSharedCalc(serializeBridgedCalc(data));
    assert.deepEqual(published.pokewebBattleRules, data.pokewebBattleRules);
    assert.equal("_meta" in published, false);
    assert.equal("trainers" in published, false);
    data.pokewebBattleRules.abilityTemplates = {};
    assert.throws(() => serializeBridgedCalc(data), /expanded Pokeweb/);
});

test("publishes and reads a full 5 MB JSON file, rejects malformed and oversized uploads", async t => {
    t.mock.method(globalThis, "fetch", async (_, options) => {
        assert.equal(options.body.get("secret"), "test-secret");
        return Response.json({ success: true, hostname: "hzla.github.io", action: "publish-calc" });
    });
    const env = environment();
    const exactLimit = text.padEnd(MAX_CALC_BYTES);
    const response = await upload(env, exactLimit);
    assert.equal(response.status, 201);
    const { id } = await response.json();
    assert.match(id, /^[a-f0-9]{32}$/);
    const loaded = await worker.fetch(new Request("https://worker.test/calcs/" + id, {
        headers: { Origin: origin }
    }), env);
    assert.equal(loaded.headers.get("Access-Control-Allow-Origin"), origin);
    assert.match(loaded.headers.get("Cache-Control"), /immutable/);
    assert.equal(await loaded.text(), exactLimit);

    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(new Uint8Array(MAX_CALC_BYTES));
            controller.enqueue(new Uint8Array(1));
            controller.close();
        }
    });
    assert.equal((await upload(env, stream)).status, 413);
    assert.equal((await upload(env, text, { "Content-Length": String(MAX_CALC_BYTES + 1) })).status, 413);
    assert.equal((await upload(env, "{}")).status, 400);
    assert.equal(env.objects.size, 1);
});

test("blocks unauthenticated publishing and returns appropriate CORS and not-found responses", async t => {
    t.mock.method(globalThis, "fetch", async () =>
        Response.json({ success: true, hostname: "wrong.test", action: "publish-calc" }));
    const env = environment();
    assert.equal((await upload(env, text, { Origin: "https://wrong.test" })).status, 403);
    assert.equal((await upload(env, text)).status, 403);
    env.UPLOAD_LIMIT = { limit: async () => ({ success: false }) };
    assert.equal((await upload(env, text)).status, 429);
    assert.equal(env.objects.size, 0);
    const preflight = await worker.fetch(new Request("https://worker.test/calcs", {
        method: "OPTIONS", headers: { Origin: origin }
    }), env);
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get("Access-Control-Allow-Origin"), origin);
    assert.equal((await worker.fetch(new Request("https://worker.test/calcs/" + "f".repeat(32)), env)).status, 404);
});

test("kill switch blocks publishing without consuming quota or disabling reads", async () => {
    const env = environment();
    const id = "ab".repeat(16);
    await env.CALCS.put(id, new TextEncoder().encode(text), {});
    env.UPLOADS_ENABLED = "false";
    env.PUBLISH_QUOTA.getByName = () => assert.fail("Paused uploads must not reach the ledger");
    const rejected = await upload(env, text);
    assert.equal(rejected.status, 503);
    assert.match((await rejected.json()).error, /paused/);
    const read = await worker.fetch(new Request("https://worker.test/calcs/" + id), env);
    assert.equal(await read.text(), text);
});

const encode = value => new TextEncoder().encode(value);
const counters = env => env.db.prepare("SELECT * FROM quota").get();

test("deduplicates concurrent uploads, including objects predating the ledger", async () => {
    const env = environment();
    const originalId = "ab".repeat(16);
    const original = encode(text);
    await env.CALCS.put(originalId, original, {});
    const old = await env.ledger.publish(original);
    assert.deepEqual(old, { status: 200, body: { id: originalId } });

    const fresh = encode(text.replace("Community Test", "New Test"));
    const results = await Promise.all(Array.from({ length: 8 }, () => env.ledger.publish(fresh)));
    assert.equal(results.filter(result => result.status === 201).length, 1);
    assert.equal(new Set(results.map(result => result.body.id)).size, 1);
    assert.equal(env.objects.size, 2);
    assert.equal(counters(env).daily_uploads, 2);
    assert.equal(counters(env).total_bytes, original.byteLength + fresh.byteLength);
});

test("admission stops at 100 uploads, resets at UTC rollover, and preserves the total", async t => {
    t.mock.timers.enable({ apis: ["Date"], now: new Date("2026-11-25T23:59:59Z") });
    const env = environment();
    const unique = Array.from({ length: 101 }, (_, i) => encode("dataset " + i));
    const replies = await Promise.all(unique.map(bytes => env.ledger.publish(bytes)));
    assert.equal(replies.filter(result => result.status === 201).length, 100);
    assert.equal(replies.filter(result => result.status === 429).length, 1);
    const accepted = unique[replies.findIndex(result => result.status === 201)];
    assert.equal((await env.ledger.publish(accepted)).status, 200);
    const total = counters(env).total_bytes;

    t.mock.timers.tick(1000);
    const next = unique[replies.findIndex(result => result.status === 429)];
    assert.equal((await env.ledger.publish(next)).status, 201);
    assert.equal(counters(env).daily_uploads, 1);
    assert.equal(counters(env).daily_bytes, next.byteLength);
    assert.equal(counters(env).total_bytes, total + next.byteLength);
});

test("enforces daily byte and total storage boundaries independently", async () => {
    const env = environment();
    await env.ledger.ensureInventory();
    const one = encode("a");
    const two = encode("b");
    env.db.prepare("UPDATE quota SET daily_bytes = ?").run(MAX_DAILY_BYTES - 1);
    assert.equal((await env.ledger.publish(one)).status, 201);
    assert.equal((await env.ledger.publish(two)).status, 429);
    env.db.prepare("UPDATE quota SET daily_bytes = 0, total_bytes = ?").run(MAX_STORED_BYTES - 1);
    assert.equal((await env.ledger.publish(two)).status, 201);
    assert.equal((await env.ledger.publish(encode("c"))).status, 507);
    assert.equal((await env.ledger.publish(two)).status, 200);
    assert.equal(counters(env).total_bytes, MAX_STORED_BYTES);
});

test("retries a lost R2 write acknowledgement without changing its share ID or charging twice", async t => {
    const env = environment();
    const originalPut = env.CALCS.put.bind(env.CALCS);
    const put = t.mock.method(env.CALCS, "put", async (...args) => {
        await originalPut(...args);
        throw new Error("Lost write acknowledgement");
    });
    const bytes = encode(text);
    await assert.rejects(env.ledger.publish(bytes), /Lost write acknowledgement/);
    const [id] = env.objects.keys();
    put.mock.restore();
    const restarted = new PublishQuotaLedger(env.storage, env.CALCS);
    assert.deepEqual(await restarted.publish(bytes), { status: 200, body: { id } });
    assert.equal(counters(env).daily_uploads, 1);
    assert.equal(counters(env).total_bytes, bytes.byteLength);
});
