# Visitor counter deployment

The portfolio remains on GitHub Pages. Cloudflare deploys only `worker/index.ts`;
it does not build or upload the portfolio frontend. Name.com DNS needs no changes.

## After pushing these changes to master

Cloudflare's existing Git connection should build the new commit automatically:

| Cloudflare build setting | Value |
| --- | --- |
| Root directory | `/` |
| Build command | Leave empty |
| Deploy command | `npx wrangler deploy` |
| Production branch | `master` |

`bun.lockb` has been removed so automatic dependency installation uses npm and
`package-lock.json`. Wrangler is pinned locally. `.node-version` selects Node 24
for Cloudflare and the GitHub Pages workflow. `wrangler.jsonc` declares the Worker
entrypoint, enables its production URL, disables preview URLs, and preserves
dashboard variables with `keep_vars`.

In Cloudflare **Settings → Runtime variables and secrets → Production**, keep:

| Name | Type |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` | Variable |
| `UPSTASH_REDIS_REST_TOKEN` | Secret (regular read/write REST token) |

Do not add these values to GitHub Pages, source files, or any `VITE_` variable.
They are runtime bindings, not build variables. Use `.dev.vars` only with an
isolated test database; it is ignored by Git. No credentials are included here.

The frontend uses the verified public endpoint:
`https://jay-esmalla.jaesmalla1.workers.dev/api/visitors`.
If the Worker is renamed, update the endpoint in `src/lib/visitors.ts` and the
production hostname in `worker/index.ts` together.

Wait for both Cloudflare and GitHub Pages deployments to succeed. Open
`https://jayesmalla.tech` and check below the hero buttons. A browser POST to
`/api/visitors` should return `{ "visits": ..., "active": ... }`. Opening that URL
in a browser tab directly is not a health test: GET and missing Origin are rejected.
If requests return 503, verify the two runtime bindings and the Upstash database
status. The counter stays visible with dashes while real counts are unavailable.
Local previews show the same placeholders and do not write visits to Redis.

## Meaning and limits

- Visits start at launch; they are browsing sessions, not lifetime unique people.
- A random browser-local ID deduplicates refreshes and tabs on the same origin.
  Redis expires a session after 30 minutes without a heartbeat. Clearing browser
  storage, using another browser, or switching between www and apex can count again.
- Active now approximates sessions seen in the last 90 seconds. Visible tabs send
  a heartbeat every 30 seconds while recently used; after 60 seconds without input
  they stop. Returning to a hidden tab counts as activity. Navigation keeps the
  same tracker mounted. Development, preview domains and Worker previews are excluded.
- Each of up to three recently active viewers gets a deterministic pixel glyph
  inside the site's bracket frame. The Worker derives daily rotating public seeds
  with HMAC; raw session IDs, IPs, names and photos never appear in the response.
  A session keeps its icon across refreshes within the same UTC day. Icons can
  change when the recently active sample changes or the daily seeds rotate.
  The displayed active count is capped at `3+`; total visits stay exact. Without
  avatar seeds (including an older Worker), one generic placeholder is shown.
- One atomic Lua script updates the visit total, session TTL, and active-session
  sorted set. Simultaneous requests for the same ID cannot double count a visit.
- Failures replace counts with dashes and back off to at most one retry per two minutes per tab.
  Blocked browser storage disables counting instead of inflating sessions.
- Raw IP addresses are never stored in Redis. A daily rotating HMAC is used only
  for short-lived rate-limit keys: 60 requests/minute and 30 new sessions/hour per
  address. Shared networks can undercount. Known crawler user agents are excluded.
- These are approximate public counters, not fraud-proof analytics. Origin checks
  constrain browser callers but can be forged by non-browser clients. Distributed
  abuse still needs edge controls. Monitor Upstash usage; each heartbeat runs a
  Lua script with several Redis operations, and traffic and active tabs affect usage.

## Local verification (no deployment or production Redis writes)

```sh
npm ci
npm run test:worker
npm test -- src/test/visitors.test.tsx
npm run check:worker
npm run build
```

Worker tests mock the REST boundary; live Redis authentication and the Lua script
still require an end-to-end check after deployment. `check:worker` type-checks and
bundles a dry run. `deploy:worker` performs a real deployment and is a separate step.

References: [Cloudflare configuration](https://developers.cloudflare.com/workers/wrangler/configuration/),
[Upstash REST API](https://upstash.com/docs/redis/features/restapi).
