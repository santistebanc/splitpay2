# Manual sync testing (two browsers)

Use this checklist when validating create → join → expense sync on local Supabase + PowerSync.

## Start the stack

```bash
# ARM Mac / some WSL setups:
# export DOCKER_DEFAULT_PLATFORM=linux/amd64

supabase start -x vector
npm run supabase:reset
npm run powersync:start
npm run web
```

Open **http://localhost:8081** in each browser tab (not the WSL IP).

Env vars for sync are on `npm run web` (alias for `web:sync`). Offline Playwright e2e uses `web` without PowerSync so local stack does not interfere.

## Two-tab flow (simulates two devices)

### Tab A — host

1. **New Group** → name + members (e.g. `Alice, Bob`) → **Create group**
2. On the home screen, note the **join code** (`EUR · ABCDE` under the group name)
3. Open the group → **Add Expense** → save (e.g. Lunch €12, paid by Alice)

### Tab B — guest

1. **Join Group** → enter join code + your name (e.g. Bob) → join
2. Open the same group from the home screen
3. Confirm the expense from Tab A appears within a few seconds (no refresh needed)

Tab B must **join** — creating a group in Tab A does not share data with a fresh tab automatically. Each tab is a separate client until the guest joins and gets a `group_memberships` row.

## Automated checks

With the stack running:

```bash
npm run test:sync        # PowerSync regression (upload + live sync)
npm run test:e2e:sync    # Playwright two-browser join + expense
npm run verify           # full gate; sync e2e skips if stack is down
```

CI runs `test:sync` and `test:e2e:sync` in the **Sync integration** workflow (`.github/workflows/sync-integration.yml`).

## Troubleshooting

| Symptom                                 | Likely cause                                                                     |
| --------------------------------------- | -------------------------------------------------------------------------------- |
| Group in Supabase but no `members` rows | Upload bug — run `npm run test:sync`; see `docs/slices/sync-upload-hardening.md` |
| Tab B never sees expenses               | Guest did not join, or PowerSync not running                                     |
| Auth errors in console                  | Run `npm run supabase:reset`                                                     |
| Worker / sync errors on web             | Restart `npm run web` after `powersync:start`                                    |
