# 09 — Correction Preflight

Guardrails distilled from the design review + hardening work. Read before editing; translate the relevant ones into any agent packet.

## Active correction guardrails
1. **One theme source of truth.** Theme mode lives in `settingsStore.theme`; `useTheme()` reads it. Do **not** reintroduce a second theme store or hardcode colors on primary screens — style via `useTheme()`. (Original bug: dead `useThemeStore` made the picker a no-op.)
2. **No dead controls.** Every button must perform a real action or be removed. No placeholder `TouchableOpacity` without `onPress`; no fake "success" states (see forgot-password, sync).
3. **No fabricated data presented as real.** Home/plans/VOTD must derive from `readingStore`/`planCatalog`/`bibleService`, not hardcoded literals. Label any stand-in as such.
4. **Real auth only.** Never accept arbitrary credentials. Passwords go through `authService` (salt+hash); tokens in SecureStore, not AsyncStorage (web fallback only). No guest/"Skip Auth" backdoors in shipped builds.
5. **Pure logic is extracted + tested.** Streak, plan, slug, reference, reminder, and auth math live in pure modules with unit tests — keep new domain logic testable (inject native adapters; don't import `expo-*` into pure modules that tests load).
6. **Keep `tsc` + jest green.** `tsconfig` excludes `backend/` and tests; don't widen it back to pull those in. `jest` is ts-jest/node (no RN render) — put pure logic where it can be tested.
7. **Single persistence spine.** Client state persists via zustand+AsyncStorage (+SecureStore for auth). Don't write to the dormant SQLite layer; sync must adapt to the stores (T-203).
8. **Honest sync.** Do not report success without transferring data; keep sync gated until the contract is reconciled (T-201).

9. **Native modules must never crash the UI.** Use `src/utils/haptics.ts` (not `expo-haptics` directly); keep `expo-sqlite` lazy + guarded; access any absentable native capability defensively so a missing module degrades gracefully instead of blanking a screen. (Root cause of the Settings crash found in the walkthrough.)

## Provenance checks
- Every architectural claim in this pack is labeled `current`/`proposed`/`unknown`. Don't upgrade `proposed`→`current` without code/evidence.
- Backend is **present but not integrated** — never describe sync/cloud auth as working.

## Setup checks (before any change)
- `npm install` (postinstall patches applied) → `npm run typecheck` clean → `npm test` green **before** and **after** the change.

## Agent packet checks
- Packet names write scope + off-limits files, acceptance criteria, evidence requirement, and the exact verify command. If missing, it's a spike, not a build packet.

## Done criteria (per change)
- Types clean, tests green, touched flow smoke-verified, acceptance-matrix row updated, no new dead control / fake state / hardcoded color on a themed surface.
