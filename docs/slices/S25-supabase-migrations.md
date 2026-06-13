# S25 — Supabase migrations

**Status:** Done

## What changed

- `supabase init` — local Supabase project config
- `supabase/migrations/20260612100000_initial_schema.sql` — Postgres tables mirroring the mobile PowerSync schema
- `supabase-migrations.test.ts` — guards that all six tables exist in migrations
- Root `package.json` — `supabase:reset` script

## Why

Server-side schema must exist before join/sync slices (S26–S27) can write to Supabase.

## Verify

```bash
npm run verify
supabase db reset   # requires Docker
```

## Exit criteria

- [x] `supabase/` migrations present for all offline tables
- [x] `npm run verify` green
- [x] `supabase db reset` locally (ARM: `DOCKER_DEFAULT_PLATFORM=linux/amd64`, `supabase start -x vector`)

## RED → GREEN

1. **RED** — no `supabase/migrations` directory
2. **GREEN** — initial migration + migration guard test

## Tests added

- `supabase migrations › defines every offline table in an initial migration`

## Manual checklist

- [x] Docker running → `supabase db reset` completes without errors
- [ ] `supabase db diff` shows no drift after reset

## Files touched

- `supabase/config.toml`, `supabase/migrations/20260612100000_initial_schema.sql`
- `supabase-migrations.test.ts`, `package.json`
- `docs/SLICES.md`, `docs/ROADMAP.md`, this file

## Read first

1. `supabase/migrations/20260612100000_initial_schema.sql`
2. `apps/mobile/src/db/schema.ts`

## Next slice

**S26** — Edge function: join.
