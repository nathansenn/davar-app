# Davar — Architecture & Build Pack

Build-ready architecture and implementation docs for the Davar Bible study app, generated with the `idea-architecture-docs` methodology. Every claim is labeled `current` (verified against code), `proposed`, or `unknown`.

## Read order
1. `MISSION.md` — objective, phases, status.
2. `00-brief.md` — outcome, users, non-goals, success proof.
3. `SOURCE-OF-TRUTH.md` — canonical root, commands, deploy targets.
4. `01-product-scope.md` → `04-ui-ux.md` — scope, architecture, data/APIs, UI.
5. `05-build-plan.md` + `06-agent-packets.md` — milestones + delegable work (task IDs).
6. `10-page-by-page.md` + `12-screen-acceptance-matrix.md` + `13-code-and-test-map.md` — screen specs, build status, code↔test.
7. `07-risk-register.md` · `08-verification-plan.md` · `09-correction-preflight.md` · `11-checklists.md` — risks, verification, guardrails, launch.
8. `GRAPH_INDEX.yaml` — machine-readable concept/task → doc/code routing.

## Snapshot (`current`)
- **Stack:** Expo SDK 52, React Native 0.76, expo-router v4, zustand, TypeScript. Offline-first; runs in Expo Go (no custom native).
- **Status:** P0 correctness hardening merged (dark mode, plans→progress, real local auth, notifications, contrast). 6 test suites / 47 unit tests green; web bundle + runtime smoke clean.
- **Next:** P1 polish (a11y, verse-scroll, modal pickers) → P2 server sync → P3 store submit.
- **Backend:** `backend/` (Express+Prisma+Postgres) exists but is **not integrated**.

Companion: `docs/DESIGN_REVIEW.md` (the critical audit this pack builds on).
