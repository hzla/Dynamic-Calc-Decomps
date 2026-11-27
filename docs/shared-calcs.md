# Publishing shared calcs

After syncing a dataset from Pokeweb into the blank dev calculator, select
**Publish Calc** in the dev controls and complete verification. The calculator
builds the JSON from the synced data and returns a `?share=<id>` URL. The button
is not shown for bundled calcs, share links, or a dev calc without bridge data.
If the dataset was synced before this feature, sync it again to enable publishing.
A Cloudflare Worker is the only service that reads or
writes the private R2 bucket. Share links are public to anyone who has the
URL. Uploaders do not need an account.

## Deploy

1. Sign in to Cloudflare and enable R2 on the target account. Run
   `npx wrangler login` and `npx wrangler whoami` from the repo root.
2. Create a Standard R2 bucket with
   `npx wrangler r2 bucket create dynamic-calc-shares`. Leave both the
   public development URL and custom-domain access disabled.
3. Create a managed Turnstile widget for `hzla.github.io` in the Cloudflare
   dashboard. Put its **public site key** in
   `cloudflare/calc-share/wrangler.jsonc`. Adjust `ALLOWED_ORIGINS` if the
   frontend is also published on another origin.
4. Set the secret interactively with
   `npx wrangler secret put TURNSTILE_SECRET --config cloudflare/calc-share/wrangler.jsonc`.
   Deploy with `npx wrangler deploy --config cloudflare/calc-share/wrangler.jsonc`.
   Never commit the Turnstile secret or Cloudflare account credentials.
5. Set `CALC_SHARE_ORIGIN` in `js/shared_calc_config.mjs` to the deployed
   Worker origin, then publish the Decomps frontend.
6. Before announcing the feature, publish and reopen a representative
   dataset near 5 MB through the deployed Worker. Check the dashboard for
   CPU and quota errors. Workers Free has a 10 ms CPU limit per invocation;
   parsing and validating a dense 5 MB file may require Workers Paid.

## Format and limits

- The publish request is UTF-8 JSON generated from the bridged dataset, with
  `title`, `formatted_sets`, `poks`, and `moves`. Trainer order, name
  replacement maps, and expanded Pokeweb battle rules are retained when
  provided; private box data and current battle state are not exported.
- The maximum is 5,000,000 bytes. Public uploads cannot include arbitrary
  extension fields, HTML, or HTML attribute syntax. Bundled and npoint
  datasets are not subject to this new upload schema.
- The generated link carries the synced calculator's mechanics settings and
  does not need dev mode. Bundled game profiles do not apply to published datasets.
- R2 object IDs are immutable. Byte-identical uploads reuse an existing link,
  including shares created before the quota ledger. A changed file gets a new
  link. There is no automatic expiration.
- New uploads are limited globally to 100 files or 100,000,000 bytes per UTC
  day, whichever comes first, and 5,000,000,000 bytes total. Duplicates do
  not consume another slot or more storage. The per-IP and per-location
  rate limits still apply before the global checks.

## Upload controls

- Set `UPLOADS_ENABLED` to the string `false` under the Worker's production
  runtime variables and deploy that setting to pause only new publish
  requests. Set it to `true` to reopen publishing. Keep the Wrangler config
  in sync, since a later Wrangler deploy can overwrite dashboard variables.
- When migrating from the pre-quota Worker, pause its write traffic (for
  example, temporarily clear its allowed origins). The first verified upload
  on the quota Worker inventories existing R2 objects before accepting any
  writes. Do not write directly to the bucket while bootstrapping or bypass
  the ledger afterwards.
- The ledger reserves space before writing. An interrupted write keeps its
  reservation; retrying the same file reuses it. Admin deletion in R2 leaves
  the ledger conservatively charged and does not let a duplicate resurrect
  the file. A cached copy may remain available for up to one day. Do not
  discard the ledger or reset its counters to free capacity.

Run the Worker contract tests with
`node --test cloudflare/calc-share/worker.test.mjs`.
