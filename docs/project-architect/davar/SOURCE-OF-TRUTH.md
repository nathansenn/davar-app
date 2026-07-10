# SOURCE-OF-TRUTH

## Canonical project root
`/` (repo root) — the Expo React Native app. This is the canonical edit target for all app work.

## Roots considered
- `/` — **canonical.** Expo app (`app/`, `src/`, `assets/`). Metro/Babel build; Expo Router entry (`package.json main: expo-router/entry`).
- `/backend` — **separate deployable, NOT canonical for app work.** Express + Prisma + Postgres API with its own `package.json`, `tsconfig.json`, and `node_modules`. Deployed to Railway (`backend/railway.toml`, `backend/Dockerfile`). Excluded from the app `tsconfig`. Currently **not contacted by the app**. `[current]`
- No duplicate `final`/`AAA`/snapshot roots exist. `[current]`

## Source directories `[current]`
- `app/` — routed screens: `(auth)/`, `(tabs)/`, `read/[passage].tsx`, `_layout.tsx`, `index.tsx`.
- `src/components/` — `reading/`, `study/`, `home/`, `common/`.
- `src/services/` — data + domain services (bible, plans, auth, notifications, audio, sync, lexicon, strongs).
- `src/stores/` — zustand stores (auth, settings, reading, userData).
- `src/utils/`, `src/lib/theme.ts`, `src/types/`.
- `assets/` — bundled scripture, strongs, plans, metadata, icons.
- `scripts/` — data build scripts (`convert-bible.js`, `build-frequency-index.js`, `generate-plans.js`, `verify-bible-data.js`, `download-bibles.js`).

## Generated / output directories to avoid
- `dist/` — `expo export` web output (gitignored). Not source.
- `.expo/` — Expo caches. Not source.
- `node_modules/`, `backend/node_modules/` — vendored.

## Vendor / archive / snapshot directories to avoid
- `patches/` — `patch-package` diffs (applied at postinstall; edit deliberately, not casually).
- `assets/strongs-source/` — raw strongs inputs for the build scripts; the app reads `assets/strongs/` outputs.

## Build / test / verify commands `[current]`
- Install: `npm install` (runs `patch-package` postinstall).
- Typecheck: `npm run typecheck` → `tsc --noEmit`.
- Unit tests: `npm test` → `jest` (ts-jest, node env; 6 suites / 47 tests).
- Dev (Expo Go): `npx expo start` (add `--tunnel` off-LAN).
- Web bundle smoke: `npx expo export --platform web`.
- Runtime smoke (optional): headless Chromium harness against `dist/` (see `08-verification-plan.md`).

## Production / deployment target `[current + proposed]`
- **App:** iOS + Android via EAS Build (`eas.json`: `preview`, `production`). iOS bundle `app.davar.bible`, ASC app id `6758521997`, team `3Q84PC48CK`. Android package `app.davar.bible`. `[current — configured]`
- **Backend:** Railway (Docker) — `[current — configured, not integrated]`.

## Confidence and open questions
- Confidence: **high** on app root, stack, data, and commands (directly exercised in-session).
- Open: (1) Is the Railway backend actually deployed/reachable? `[unknown]` (2) EAS project credentials/secrets availability for a production build? `[unknown]` (3) Distribution rights for BSB/translations already vetted (docs say Public Domain)? `[current per docs, verify before store submit]`.
