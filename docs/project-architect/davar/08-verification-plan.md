# 08 — Verification Plan

## Static checks `[current — green]`
- `npm run typecheck` → `tsc --noEmit`, 0 errors (app scope; backend excluded).

## Unit / integration tests `[current — 47/47]`
- `npm test` → jest (ts-jest). Suites: referenceParser, bookSlug, planCatalog, streak, authService, reminderTime.
- **Add (P1):** bibleService `search`/`getChapter`; store integration with mocked AsyncStorage; sync contract (mocked fetch).

## Browser walkthrough (runtime smoke) `[current]`
- Serve `dist/` (from `expo export -p web`) and drive with headless Chromium (`playwright-core`, browser at `/opt/pw-browsers`).
- **Full 27-screen walkthrough performed** (in-app tab nav + a few deep links; storage-seeded active plan): login, register (+ filled), Home (no-plan + active-plan), Read/Browse, book search, reference jump, full-text verse search, chapter picker, reader (Genesis 1 + verse deep-link), interlinear, audio controls, word-study, highlight menu, note editor, plans (active), settings, font/translation/theme pickers, and **full dark mode** (settings/home/read/plans/reader). Result: **0 fatal errors**, a screenshot captured per screen.
- This walkthrough caught two real native-module fragilities (since fixed, PR #6): `expo-sqlite` import crashing Settings on web, and `expo-haptics` throwing on tap — both now crash-proof.
- Harness pattern: static server + `chromium.launch({executablePath})` + `setDefaultTimeout` + assert body text/`aria-label` + collect `pageerror`; write per-screen screenshots + a report. (Harness lives in the scratchpad; re-create per run — not committed.)
- **Caveat:** web-only. Push notifications firing, haptic feedback, and actual TTS audio are native-only and require an on-device Expo Go pass to verify end-to-end.

## Desktop / mobile coverage
- Primary: **Expo Go on a physical iOS + Android device.** Manual pass of the 4 walkthrough scenarios in `04-ui-ux.md`.
- Web is a verification harness only, not a target surface.

## Visual / media checks
- Dark + light theme snapshot of each primary screen (manual or screenshot script).
- Audio (TTS) manual on device (no automated audio assertion).

## Setup / deployment parity
- `npx expo start` boots in Expo Go with no custom native modules (verified by module set: secure-store, notifications, sqlite, crypto, speech, haptics — all in Expo Go runtime).
- Pre-store: EAS `preview` internal build installs and runs the daily loop.

## Evidence paths
- Static/unit: local `npm run typecheck` + `npm test` output.
- Runtime: exported `dist/` + Chromium harness logs + screenshots (delivered in-session).
- Device: manual pass notes (to be recorded per release in `11-checklists.md`).

## Gates
- **Before build delegation:** `npm run typecheck && npm test` green.
- **Before merge of UI work:** touched screens have acceptance rows updated in `12-screen-acceptance-matrix.md`.
- **Before final handoff / store:** full static+unit+web-export clean **and** on-device Expo Go pass of all scenarios.

See `13-code-and-test-map.md` for the source↔test mapping and coverage gaps.
