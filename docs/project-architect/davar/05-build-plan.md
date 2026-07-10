# 05 — Build Plan

## Milestones
- **M0 — Correctness (P0):** dark mode, plans→progress, real auth, notifications, contrast/config. **DONE** (PRs #2, #3).
- **M1 — Polish (P1):** study-modal a11y, verse-scroll deep links, modal pickers, iconography, audio inset, nav model. **NEXT.**
- **M2 — Server integration (P2):** reconcile sync contract, wire real auth/sync to Railway backend, reconcile/retire SQLite.
- **M3 — Store submission (P3):** EAS production build, screenshots, privacy manifest, review + submit.

## Vertical slice (already proven)
Auth(local) → plan → today's passage → reader → complete → streak persisted. Keep this green as the regression anchor.

## Setup tasks
- [x] Test infra (jest/ts-jest), scoped tsconfig, `test`/`typecheck` scripts.
- [ ] Add crash/error reporting (Sentry) behind env flag. `[P3]`
- [ ] Confirm EAS credentials + `EXPO_TOKEN` availability for CI/build. `[P3]`

## Implementation tasks (by milestone)
**M1**
- Study-modal a11y (labels + `accessibilityViewIsModal`) — T-101.
- Verse-scroll for `?verse` deep links — T-102.
- Replace tap-to-cycle settings with modal `OptionPicker` (translation/theme/font) — T-103.
- Consistent iconography (emoji → Ionicons) in study surfaces — T-104.
- Reader nav model (`push`/`replace`) + persisted "Mark Complete" — T-105.

**M2**
- Reconcile `syncService` ↔ backend route contract — T-201.
- Wire real server auth (JWT) with local fallback — T-202.
- Enqueue sync on userData/reading changes; reconcile or retire SQLite `database.ts` — T-203.

**M3**
- EAS production build + store screenshots + privacy/data-safety forms — T-301.

## Integration tasks
- Keep `readingStore`/`userDataStore` as the single client persistence spine until sync lands; sync must adapt to them (not fork a second model).
- Any new screen: add page-by-page spec + acceptance row + code/test map entry before merge.

## Verification tasks
- Per PR: `npm run typecheck && npm test` green; `expo export -p web` clean; runtime smoke for touched flows.
- Pre-store: on-device Expo Go pass of all 4 walkthrough scenarios (`04-ui-ux.md`).

## Rollback / fallback
- Server sync ships behind a feature check; if the backend is unreachable, the app stays fully functional offline (current default). No data loss because local stores remain the source of truth.
- EAS: keep `preview` internal channel for smoke before `production`.
