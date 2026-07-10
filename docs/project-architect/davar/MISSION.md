# MISSION — Davar

- **Mission ID:** DAVAR-ARCH-001
- **Owner:** nathansenn (nathan.senn90@gmail.com)
- **Status:** Active — MVP implemented and hardened; server-backed sync + polish outstanding.
- **Objective:** Ship a beautiful, offline-first Bible study app (KJV/ASV/BBE/BSB + Hebrew/Greek interlinear, Strong's word study, reading plans, TTS audio, highlights/notes/bookmarks) to iOS/Android via Expo, production-grade and App-Store-ready.
- **Constraints:**
  - Expo managed workflow (SDK 52); must run in **Expo Go** with no custom native code. `[current]`
  - Offline-first: full Bible text + study data bundled; no network required for reading. `[current]`
  - Bundle size is large (~38 MB of scripture/lexicon JSON) — must lazy-load heavy translations. `[current]`
  - Single-maintainer project; work must be delegable to agents with explicit packets. `[proposed]`
- **Success criteria:**
  1. `npm run typecheck` clean, `npm test` green, `expo export -p web` bundles clean. `[current — met]`
  2. Every advertised control performs a real action (no dead buttons / fake states). `[current — met for P0]`
  3. App installs and runs end-to-end in Expo Go: auth → plan → read → complete → streak. `[current — verified in web runtime harness]`
  4. Dark mode, accessibility, and WCAG contrast pass on all primary surfaces. `[current — primary surfaces met; study modals pending]`
  5. Cross-device sync works against the backend. `[proposed — not met]`
- **Priority focus:** Convert the offline MVP into a store-submittable build; then wire server-backed accounts/sync.
- **Phases:**
  - P0 — Correctness/ship-blockers (dark mode, plans flow, real auth, notifications, contrast). **Done.**
  - P1 — Polish (full a11y, verse-scroll deep links, modal pickers, iconography). **In progress.**
  - P2 — Server integration (auth + sync against Railway backend), SQLite reconciliation. **Not started.**
  - P3 — Store submission (EAS production build, screenshots, review). **Not started.**
- **Current context checkpoint:** All P0 + significant P1 merged to `master` (PRs #2, #3). 6 test suites / 47 unit tests. Backend exists but is not contacted by the app.
- **Next activation command:** `npx expo start` (Expo Go dev) — or continue P1/P2 packets in `06-agent-packets.md`.
