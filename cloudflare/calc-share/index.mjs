import { DurableObject } from "cloudflare:workers";
import { PublishQuotaLedger } from "./publish-quota.mjs";
export { default } from "./worker.mjs";

export class CalcPublishQuota extends DurableObject {
    constructor(ctx, env) {
        super(ctx, env);
        this.ledger = new PublishQuotaLedger(ctx.storage, env.CALCS);
    }

    publish(bytes) {
        return this.ledger.publish(bytes);
    }
}
