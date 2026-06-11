# ADR 0001: Micro-slices and tracer-bullet phasing

**Status:** Accepted

## Context

SplitPay is a large spec (offline-first app, PowerSync, Supabase, full UI). Building everything at once is hard to review and risky.

## Decision

- Build in **micro-slices**: one concrete, testable addition per slice
- **Tracer-bullet order**: ledger tests → local SQLite + offline UI → sync/backend last
- **Web-first** development (Expo web), mobile parity before sync slice
- **Monorepo**: `apps/mobile` + `packages/ledger` (extract `packages/db` only when sync forces it)
- **PowerSync SDK from day 1** for local DB (works offline without cloud env)

## Consequences

- Progress is visible and committable every slice
- `docs/ROADMAP.md` is the forward plan; chat is not
- Sync complexity deferred until offline money loop works
