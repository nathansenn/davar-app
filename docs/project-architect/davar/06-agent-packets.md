# 06 — Agent Packets

Each packet is scoped by ownership boundary. Every packet: run `npm run typecheck && npm test` before handoff; add/adjust tests; keep integration judgment with the main agent.

---

### T-101 — Study-modal accessibility
- **Owner type:** RN UI. **Write scope:** `src/components/study/{WordDetailModal,StrongsSearchModal,HighlightMenu,NoteEditor}.tsx`. **Off-limits:** stores, services.
- **Inputs:** `10-page-by-page.md` §M-01..M-04; `docs/DESIGN_REVIEW.md` §4.
- **Do:** add `accessibilityRole="button"` + `accessibilityLabel` to every icon/emoji-only control (close, color swatches, actions); add `accessibilityViewIsModal` to sheet content.
- **Acceptance:** every tappable control has a label; VoiceOver/TalkBack reaches close. **Evidence:** manual screen-reader pass notes. **Depends:** none.

### T-102 — Verse-scroll deep links
- **Owner type:** RN UI. **Write scope:** `app/read/[passage].tsx`, `src/components/reading/ChapterView.tsx`. **Off-limits:** services.
- **Inputs:** `referenceParser.referenceToPath` already emits `?verse=`; `10-page-by-page.md` §S-09.
- **Do:** read `?verse` param; pass target to `ChapterView`; scroll to + briefly emphasize the verse via a `ScrollView` ref + `onLayout` measurement.
- **Acceptance:** opening `/read/john-3?verse=16` scrolls John 3:16 into view. **Evidence:** runtime harness scroll assertion. **Depends:** none.

### T-103 — Modal option pickers
- **Owner type:** RN UI. **Write scope:** new `src/components/common/OptionPicker.tsx`; edit `app/(tabs)/settings.tsx` + reader translation control. **Off-limits:** stores' shapes.
- **Do:** reusable bottom-sheet single-select; replace tap-to-cycle for translation/theme/font with it.
- **Acceptance:** options visible, selectable, reversible; Android shows all options (no 3-button Alert). **Depends:** none.

### T-201 — Reconcile sync contract
- **Owner type:** integration. **Write scope:** `src/services/syncService.ts` (+ read `backend/src/routes/sync.ts`). **Off-limits:** UI.
- **Do:** align client to backend routes (`POST /sync/push`,`/sync/pull`,`/sync/full`), drop `/api` prefix + per-entity GET; use real bearer token; make failures explicit.
- **Acceptance:** against a running backend, push+pull round-trips a highlight; offline path unchanged. **Evidence:** integration test w/ mocked fetch + one live round-trip. **Depends:** T-202. **Blocker:** requires a reachable backend `[unknown]`.

### T-202 — Server-backed auth (with local fallback)
- **Owner type:** integration. **Write scope:** `src/services/authClient.ts`, `src/stores/authStore.ts`. **Off-limits:** `authService.ts` core contract.
- **Do:** add a server adapter calling `POST /auth/login|register`; store JWT in SecureStore; fall back to local auth when offline/unreachable.
- **Acceptance:** register/login hit backend when online; offline still works. **Evidence:** unit (mocked fetch) + one live login. **Depends:** reachable backend.

### T-203 — Sync enqueue + SQLite reconciliation
- **Owner type:** state/data. **Write scope:** `src/stores/{userDataStore,readingStore}.ts`, `src/services/syncService.ts`; decide fate of `src/services/{database,planService}.ts`.
- **Do:** call `queue*Sync` on change so `pendingCount` is real; then either fully adopt SQLite or delete the dead layer (unblocked once `syncService` no longer needs `getDatabase`).
- **Acceptance:** editing a highlight increments pending count; chosen persistence model is singular. **Depends:** T-201.

### T-301 — Store submission build
- **Owner type:** release. **Write scope:** `app.json`, `eas.json`, `assets/`, store docs. **Off-limits:** app logic.
- **Do:** produce EAS `production` build; capture screenshots (`docs/screenshots-needed.md`); complete privacy/data-safety; `eas submit`.
- **Acceptance:** build passes store review. **Depends:** M1 complete; credentials available `[unknown]`.
