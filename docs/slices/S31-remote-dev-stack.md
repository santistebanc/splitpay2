# S31 — Remote Supabase + PowerSync (dev)

**Status:** Done (pending user confirm)

## What changed

- **`env/local.example`**, **`env/dev.example`** — documented env templates for local Docker vs hosted dev
- **`scripts/with-env.sh`** — load env file and run a command (used by web/mobile dev scripts)
- **`scripts/deploy-dev.sh`** — `supabase db push` + deploy `join` edge function
- **`scripts/check-remote-dev.sh`** — smoke-check hosted Supabase/PowerSync URLs
- **`apps/mobile/src/db/sync-environment.ts`** — classify local LAN vs remote hosted URLs
- **`npm run web:dev`**, **`mobile:remote`**, **`deploy:dev`**, **`check:remote-dev`**
- **`docs/REMOTE-DEV.md`** — provisioning guide (Supabase project, PowerSync Cloud, daily workflow)
- **`.github/workflows/deploy-dev.yml`** — optional deploy on merge when GitHub secrets are set

## Why

Local Docker + `LAN_IP` is painful on WSL/Windows phone testing. A shared hosted **dev** stack lets any device sync over HTTPS with only env vars — separate from future production.

## Verify

```bash
npm run verify
```

Manual (after provisioning — see `docs/REMOTE-DEV.md`):

```bash
cp env/dev.example env/dev.local   # fill in URLs
npm run check:remote-dev
npm run deploy:dev
npm run web:dev                    # laptop
npm run mobile:remote              # phone — scan QR
```

## Exit criteria

- [x] Env templates + load script for remote dev
- [x] Deploy script for Supabase migrations + join function
- [x] App starts against remote stack via `web:dev` / `mobile:remote`
- [x] `npm run verify` green

## Read first

- `docs/REMOTE-DEV.md`
- `env/dev.example`
- `scripts/deploy-dev.sh`

## Next slice

Production hardening, PR web previews, or EAS staging builds — see `ROADMAP.md`.
