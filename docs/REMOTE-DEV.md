# Remote dev stack (S31)

Hosted **Supabase + PowerSync Cloud** for phone testing without local Docker, `LAN_IP`, or firewall rules. Production uses a **separate** Supabase project and PowerSync instance — never share credentials with dev.

## Environments

| Stack            | When                         | Config                       |
| ---------------- | ---------------------------- | ---------------------------- |
| **Local**        | Daily coding, CI, offline UI | Docker + `env/local.example` |
| **Dev (remote)** | Phone / shared staging       | Hosted + `env/dev.local`     |
| **Production**   | Real users (later slice)     | Separate hosted projects     |

## One-time setup

### 1. Create Supabase dev project

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project** (name it e.g. `splitpay-dev`).
2. Note **Project URL** and **anon public** key (Settings → API).
3. Enable **Anonymous sign-ins** (Authentication → Providers → Anonymous → Enable).

### 2. Link repo and push schema

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
npm run deploy:dev
```

Or set `SUPABASE_PROJECT_REF=your_ref` in `env/dev.local` and run `npm run deploy:dev`.

This runs migrations from `supabase/migrations/` and deploys the `join` edge function.

### 3. PowerSync Cloud (dev instance)

Follow [Supabase + PowerSync](https://docs.powersync.com/integrations/supabase/guide):

1. Create a **PowerSync Cloud** instance linked to your dev Supabase project.
2. **Database connection** — use Supabase direct connection + `powersync_role` ([setup guide](https://docs.powersync.com/integrations/supabase/guide)).
3. **Client auth** — enable **Use Supabase Auth** (JWKS auto-configured for new signing keys).
4. **Sync rules** — open Sync Rules in the dashboard, paste contents of [`powersync/sync-rules.yaml`](../powersync/sync-rules.yaml), **Validate**, then **Deploy**.

Local Docker config in `powersync/config.yaml` is for local dev only — cloud uses the dashboard.

### 4. Client env file

```bash
cp env/dev.example env/dev.local
```

Edit `env/dev.local`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_POWERSYNC_URL=https://YOUR_INSTANCE.powersync.journeyapps.com
SUPABASE_PROJECT_REF=YOUR_PROJECT_REF
```

Verify reachability:

```bash
npm run check:remote-dev
```

## Daily workflow

### Develop locally (unchanged)

```bash
supabase start -x vector
npm run supabase:reset
npm run powersync:start
npm run web:sync
```

Push slices → GitHub CI runs verify + sync integration against **local Docker in CI**, not your remote dev stack.

### Test against remote dev

**Web:**

```bash
npm run web:dev
```

**Phone (Expo Go or dev build):**

```bash
npm run mobile:remote
```

Scan the QR code — no `LAN_IP` needed; the phone talks to hosted HTTPS endpoints.

**Two-device sync:** laptop on `npm run web:dev`, phone on `npm run mobile:remote`, same join code flow as [`MANUAL-SYNC-TESTING.md`](./MANUAL-SYNC-TESTING.md).

### Deploy backend changes to dev

After merging migration or edge-function changes to `main`:

```bash
npm run deploy:dev
```

Then re-deploy sync rules in the PowerSync dashboard if `powersync/sync-rules.yaml` changed.

Optional: GitHub Actions **Deploy dev** workflow (manual or on push to `main` when secrets are set — see `.github/workflows/deploy-dev.yml`).

## Scripts

| Command                    | Purpose                                     |
| -------------------------- | ------------------------------------------- |
| `npm run web:dev`          | Web app → remote dev env                    |
| `npm run mobile:remote`    | Metro tunnel → remote dev env               |
| `npm run deploy:dev`       | `supabase db push` + deploy `join` function |
| `npm run check:remote-dev` | Curl health check for `env/dev.local`       |

## CI vs remote dev

| Job                    | Stack                                          |
| ---------------------- | ---------------------------------------------- |
| `ci.yml`               | Unit + Playwright (mocked join auth)           |
| `sync-integration.yml` | Ephemeral local Supabase + PowerSync in Docker |
| `deploy-dev.yml`       | Optional push to **your** hosted dev project   |

CI does not replace manual smoke tests on remote dev before releases.

## Production (later)

- New Supabase project + PowerSync instance
- Stricter RLS, real auth (not anonymous-only)
- Deploy only from tagged releases
- Mobile via EAS with production env vars

See [`ROADMAP.md`](./ROADMAP.md) for follow-up slices.

## Troubleshooting

| Symptom                      | Fix                                                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Join fails / 401             | Anonymous auth enabled on dev project?                                                                                                   |
| Sync never downloads         | PowerSync sync rules deployed? Auth enabled in PowerSync dashboard?                                                                      |
| `supabase db push` fails     | Run `supabase link`; check migration order                                                                                               |
| Phone works, laptop doesn't  | Both using same `env/dev.local` vars via `web:dev` / `mobile:remote`                                                                     |
| All replication slots in use | Supabase dashboard → delete inactive replication slots ([PowerSync docs](https://docs.powersync.com/configuration/source-db/connection)) |
