# 00 — Brief

## Outcome
A polished, offline-first mobile Bible study app ("Davar" — Hebrew *dāḇār*, "word") that lets a reader follow a daily reading plan, read scripture in multiple English translations with Hebrew/Greek interlinear and Strong's word study, listen via TTS, and keep highlights, notes, bookmarks, and a reading streak — all working without a network connection.

## Target users
- Daily devotional readers who want streaks + plans. `[current]`
- Students of scripture who want original-language interlinear + Strong's lexicon. `[current]`
- Offline/low-connectivity users (travel, missions). `[current]`

## Why now
The app already has real, bundled scripture + lexicon data and a working reader; the gap was that several advertised features were wired to nothing. P0 hardening (merged) made the core loop real. The remaining distance to launch is polish + optional server sync.

## Source material `[current unless noted]`
- Code: `app/` (expo-router screens), `src/` (components, services, stores, utils, lib).
- Data: `assets/bibles/{kjv,asv,bbe,bsb,wlc,tr,byz}.json` (~34 MB), `assets/strongs/{greek,hebrew,frequency-index}.json` (~4 MB), `assets/plans/*.json` (3 plans), `assets/metadata/books.json`.
- Prior review: `docs/DESIGN_REVIEW.md` (critical audit + remediation status).
- Store prep: `docs/app-store-description.md`, `docs/play-store-description.md`, `docs/screenshots-needed.md`, `docs/deployment.md`.
- Backend: `backend/` (Express + Prisma + Postgres) `[current — present but not integrated with the app]`.

## Non-goals
- Social/sharing feed, community, or comments. `[out of scope]`
- In-app purchases / paid tiers (MVP is free). `[out of scope]`
- Web as a first-class product surface (web build exists only as a verification/runtime harness). `[out of scope]`
- Live server sync in the MVP slice (offline-local is the shipping default). `[deferred to P2]`

## Success proof
- `npm run typecheck` (clean), `npm test` (47 passing), `npx expo export -p web` (bundles clean). `[current — evidence: CI-equivalent local runs]`
- Runtime walkthrough: register → Home → Plans rendered with 0 fatal JS errors via headless Chromium against the exported web build. `[current — evidence: scratchpad smoke/flow harness, screenshots delivered in-session]`
- Store-readiness: EAS production build + submission passes review. `[unknown — not yet attempted]`
