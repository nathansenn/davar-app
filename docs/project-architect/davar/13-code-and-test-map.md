# 13 — Code and Test Map

## Canonical implementation root
`/` (Expo app). Non-canonical: `/backend` (separate deployable, not wired).

## Package scripts and exact commands `[current]`
| Purpose | Command |
| --- | --- |
| Install | `npm install` (postinstall `patch-package`) |
| Typecheck | `npm run typecheck` → `tsc --noEmit` |
| Unit tests | `npm test` → `jest` |
| Dev (Expo Go) | `npx expo start` (`--tunnel` off-LAN) |
| Web bundle smoke | `npx expo export --platform web` |
| Runtime smoke | headless Chromium harness vs `dist/` (see `08-verification-plan.md`) |

## Test framework and config `[current]`
- **jest** + **ts-jest** (node env), `jest.config.js`. Pure-logic tests only (no RN render) — chosen because `jest-expo` fails on `expo-modules-core` ESM in this env.
- App `tsconfig.json` scoped to `app/`,`src/`,`scripts/`; excludes `backend/` and `**/*.test.ts`.
- No mocks/fixtures/seeders needed (pure functions + injected adapters).

## Source ↔ test map `[current]`

| Feature | Source | Test file | Type | Count |
| --- | --- | --- | --- | --- |
| Reference parsing | `src/utils/referenceParser.ts` | `src/utils/__tests__/referenceParser.test.ts` | unit | 9 |
| Book id/slug/testament | `src/utils/bookSlug.ts` | `src/utils/__tests__/bookSlug.test.ts` | unit | 5 |
| Plan catalog | `src/services/planCatalog.ts` | `src/services/__tests__/planCatalog.test.ts` | unit | 7 |
| Streak/progress math | `src/utils/streak.ts` | `src/utils/__tests__/streak.test.ts` | unit | 9 |
| Auth (hash/validate/session) | `src/services/authService.ts` | `src/services/__tests__/authService.test.ts` | unit | 12 |
| Reminder time | `src/utils/reminderTime.ts` | `src/utils/__tests__/reminderTime.test.ts` | unit | 5 |
| **Total** | | | | **6 suites / 47** |

## Source files with NO direct unit test (logic embedded / RN-bound) `[current]`
- `src/services/bibleService.ts` — in-memory reads (exercised indirectly by planCatalog/VOTD + runtime). **Gap:** add unit tests for `search`/`getChapter`.
- `src/services/authClient.ts` — native adapters (integration-only).
- `src/services/notificationService.ts` — native scheduling (pure part `reminderTime` is tested).
- `src/services/{audioService,syncService,lexiconService,strongsService,strongsSearchService}.ts` — **Gap:** untested.
- `src/stores/*` — persist+RN; pure logic extracted to `utils/streak` (tested). **Gap:** store integration test with mocked AsyncStorage.
- All screens/components — no component tests. **Gap:** covered only by runtime web smoke.

## Runtime evidence `[current]`
- `npx expo export -p web` → clean bundle (46.7 MB, expected — bundled Bibles).
- Headless Chromium (playwright-core) vs served `dist/`:
  - Boot → login screen renders, 0 fatal JS errors.
  - Register → Home → Plans navigation, 0 fatal JS errors.
- Screenshots delivered in-session (login, home, plans).

## Known pass/fail
- Unit: **47/47 pass.** Typecheck: **clean.** No known failing tests.
- Not covered: on-device notification permission, SecureStore on hardware, audio TTS on hardware, sync (inactive).

## Required command before build delegation
`npm run typecheck && npm test` (must be green).

## Required command before final handoff
`npm run typecheck && npm test && npx expo export -p web` (all clean) + a manual Expo Go device pass of the daily loop.
