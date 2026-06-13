# S26 — Edge function: join

**Status:** Done (awaiting confirm)

## What changed

- `supabase/functions/join/index.ts` — POST edge function: validate join code, add member, return group roster
- `supabase/migrations/20260613050000_api_grants.sql` — GRANTs so service_role can read/write tables via PostgREST
- `supabase-join.test.ts` — entrypoint guard + curl-style integration tests against local Supabase (skip when not running)

## Why

Server-side join is required before PowerSync sync (S27) and Join Group UI (S28).

## Verify

```bash
npm run verify
```

## Exit criteria

- [x] Join edge function accepts `{ joinCode, displayName }` and returns group + members
- [x] curl/integration test against local Supabase
- [x] `npm run verify` green

## RED → GREEN

1. **RED** — no `supabase/functions/join/index.ts`; integration test failed (403 without grants, 404 before function load)
2. **GREEN** — join function + API grants migration + passing integration tests

## Tests added

- `supabase join edge function › defines a join function entrypoint`
- `supabase join edge function › joins a group by code against local Supabase`
- `supabase join edge function › returns 404 when the join code is unknown`

## Manual checklist

- [x] Local Supabase running (`DOCKER_DEFAULT_PLATFORM=linux/amd64 supabase start -x vector`)
- [x] Seed a group via REST or SQL, then:

```bash
curl -X POST "http://127.0.0.1:54321/functions/v1/join" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"joinCode":"ABCD2","displayName":"Bob"}'
```

## Files touched

- `supabase/functions/join/index.ts`
- `supabase/migrations/20260613050000_api_grants.sql`
- `supabase-join.test.ts`
- `docs/SLICES.md`, `docs/ROADMAP.md`, this file

## Read first

1. `supabase/functions/join/index.ts`
2. `supabase-join.test.ts`
3. `apps/mobile/src/db/join-code.ts`

## Next slice

**S27** — PowerSync connect (env-gated).
