# SplitPay development process

How we build SplitPay in micro-slices. **Any agent or developer should read this before picking up work.**

## Picking up work (new session)

Cursor rule `.cursor/rules/splitpay-development.mdc` loads this workflow automatically.

1. Read [`SLICES.md`](./SLICES.md) — what is done, what is **Next**
2. Read [`ROADMAP.md`](./ROADMAP.md) — full upcoming plan and exit criteria
3. Read the latest `docs/slices/SXX-*.md` summary for context
4. Read [`CONTEXT.md`](../CONTEXT.md) — domain vocabulary

Do **not** rely on chat history for slice order or architectural decisions.

### Copy-paste prompt (new chat)

```text
Continue SplitPay development.

Read docs/PROCESS.md, docs/SLICES.md, and docs/ROADMAP.md first.
Pick up the slice marked Next in ROADMAP.md.
Follow PROCESS.md (TDD, verify green, slice summary, wait for confirmed to commit).
```

## Micro-slice rules

- **One slice = one small, testable addition** (or a few tightly coupled ones)
- **Vertical TDD**: one failing test → minimal code → green → repeat. No horizontal “all tests then all code”
- **`npm run verify` must pass** before handoff (autofix until green)
- **Slice summary first**: chat + `docs/slices/SXX-*.md` before the user reads code
- **Commit on confirm**: user says `confirmed` → one git commit per slice
- **Simple code**: by-screen layout, no middlemen, extract only on real duplication

## Verify gate

`npm run verify` runs typecheck, format check, and tests. It grows stricter as slices add tooling (Playwright from S17, integration tests from S27).

```bash
npm install
npm run verify
```

`npm run ci` mirrors GitHub Actions.

## Testing philosophy

| Layer      | What                                                       |
| ---------- | ---------------------------------------------------------- |
| Ledger     | Pure functions, spec scenarios as test names (§19)         |
| Repository | Real SQLite (PowerSync WASM), scenario fixtures            |
| UI (S17+)  | Playwright on real web app + manual checklist in slice doc |

- Test **behavior** through public interfaces, not implementation details
- Mock only **system boundaries** (network, cloud) — not our own modules
- High-fidelity fixtures: `tests/scenarios/` (added with repository slices)

## Code layout (app)

```
apps/mobile/src/
  screens/     ← one file per screen
  db/          ← schema + query functions
  lib/         ← device id, formatting, small utils
packages/ledger/
```

## Handoff template (every slice)

```markdown
## Slice SX — Title

**What changed** — bullets
**Why** — one sentence
**Verify** — command + result
**Read first** — 1–3 files
**Next slice** — link to ROADMAP.md entry
```

## User acceptance

1. Agent posts summary
2. User runs `npm run verify` (optional)
3. User spot-checks UI slices via checklist
4. User says `confirmed` → commit
5. User says `next` → agent starts next slice from ROADMAP.md
