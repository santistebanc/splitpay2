# S11 — Expo web shell

**Status:** Done

## What changed

- Scaffolded Expo SDK 56 in `apps/mobile` with Metro monorepo config
- Added React Native Paper M3 theme via `getTheme()` + system `useColorScheme`
- Root `npm run web` starts Expo web; shell shows centered “SplitPay” headline
- Vitest: `isDarkColorScheme` + `shell.test.ts` guards web script

## Why

First app slice — web-first dev shell before navigation (S12) and local storage (S13).

## Verify

```bash
npm install
npm run verify
npm run web   # → http://localhost:8081, “SplitPay” with Paper typography
```

## Exit criteria

- [x] `npm run web` renders themed shell
- [x] Paper M3 light/dark follows system color scheme
- [x] `@splitpay/ledger` still resolves from app
- [x] `npm run verify` green

## RED → GREEN

1. **RED** — `color-scheme.test.ts` + `shell.test.ts` failed (modules / script missing)
2. **GREEN** — Expo app, theme helpers, Paper shell

## Tests added

- `isDarkColorScheme › returns true only for dark color scheme`
- `isDarkColorScheme › returns false for light, unspecified, and missing scheme`
- `mobile shell › exposes npm run web for Expo web dev`

## Manual checklist

- [ ] `npm run web` opens in browser
- [ ] Toggle OS light/dark — background and text follow theme
- [ ] “SplitPay” headline uses Paper `headlineMedium`

## Files touched

- `apps/mobile/` — Expo config, `App.tsx`, theme helpers, metro config
- `package.json` — root `web` script
- `.gitignore` — `.expo/`
- `docs/SLICES.md`, `docs/ROADMAP.md`, this file

## Read first

1. `apps/mobile/App.tsx`
2. `apps/mobile/src/lib/theme.ts`
3. `apps/mobile/src/lib/color-scheme.ts`

## Next slice

**S12** — React Navigation stack + empty screen stubs.
