# Davar

Davar is an offline-first Bible study app for iOS and Android. It combines seven bundled Bible translations, Hebrew and Greek source texts, Strong's word studies, reading plans, search, bookmarks, notes, text-to-speech, and daily reminders in an Expo/React Native application.

The repository also contains a separate Node/Express backend under `backend/`. The current mobile app works offline and uses local authentication; server-backed authentication and sync are not yet connected.

## Project status

Davar is an unreleased release candidate. The main application flows and the T-101/T-102/T-103 acceptance items are implemented:

- T-101: accessibility labels, roles, and hit targets for the primary app and reader controls
- T-102: verse deep links scroll to the requested verse
- T-103: modal option pickers replace the remaining tap-to-cycle settings

Automated readiness is checked with typechecking, 47 unit tests, and an Expo web export. Before a public store submission, complete the manual Expo Go device pass described below and decide whether server-backed auth/sync is required for version 1.0. Store submission itself is intentionally outside this repository workflow.

See [`docs/DESIGN_REVIEW.md`](docs/DESIGN_REVIEW.md) for the full acceptance matrix and remaining follow-up work.

## Prerequisites

- Node.js 18 or newer
- npm
- Expo Go or an iOS/Android simulator for device testing
- An Expo account with access to the `nathansenn/davar` EAS project for native builds

## Local development

```bash
npm install
cp .env.example .env
npm start
```

The default API URL in `.env.example` points at the documented production backend. To use a local backend, set `EXPO_PUBLIC_API_URL=http://localhost:3000`.

Common development targets:

```bash
npm run ios
npm run android
npm run web
```

## Verification

Run the required automated handoff gate:

```bash
npm run typecheck
npm test -- --runInBand
npx expo export --platform web
```

Before a native release build, also exercise the daily loop in Expo Go on a real device:

1. Register or sign in locally.
2. Start a reading plan and open today's passage.
3. Follow a verse deep link and confirm the requested verse is visible.
4. Complete the reading and confirm plan progress and streak state advance.
5. Change translation, theme, font size, and reminder time through their pickers.
6. Verify a reminder permission request and local notification on the target platform.
7. Exercise word study, notes, bookmarks, search, and text-to-speech.

Native-only behavior such as SecureStore, notification permissions, and speech cannot be certified by the web export.

## Native builds

EAS profiles live in `eas.json`:

```bash
npx eas-cli build --profile development --platform ios
npx eas-cli build --profile preview --platform all
npx eas-cli build --profile production --platform all
```

Production builds auto-increment their version. Building does not submit to either store. Store copy and screenshot requirements are maintained in:

- [`docs/app-store-description.md`](docs/app-store-description.md)
- [`docs/play-store-description.md`](docs/play-store-description.md)
- [`docs/screenshots-needed.md`](docs/screenshots-needed.md)
- [`docs/deployment.md`](docs/deployment.md)

## Backend

The backend is a separate package with its own lockfile and environment template:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

It requires PostgreSQL and a JWT secret. Do not commit `.env` files or credentials. Backend deployment details and the current client/server integration boundary are documented in `docs/deployment.md` and `docs/DESIGN_REVIEW.md`.

## Repository map

- `app/` — Expo Router screens and navigation
- `src/components/` — reusable UI and reader components
- `src/services/` — Bible data, plans, auth, notifications, audio, and sync services
- `src/stores/` — persisted application state
- `assets/` — bundled Bible texts, metadata, Strong's data, and reading plans
- `backend/` — Express/Prisma API
- `docs/` — release copy, deployment notes, screenshots, and design review

## Release decision

Current automated evidence supports creating an internal EAS preview build. Public App Store or Play Store submission remains a no-go until the manual native-device pass is recorded and the version 1.0 auth/sync scope is explicitly accepted. No store release or submission is performed by the repository commands above.
