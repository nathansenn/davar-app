# 02 — Architecture

## System context
Single-binary Expo React Native app (iOS/Android; web build only for verification). All scripture, lexicon, and plan data is **bundled** and read in-memory — the app is fully functional offline. A separate Express/Postgres backend exists for future accounts + sync but is **not currently contacted**. `[current]`

```
┌───────────────────────────── Device (Expo Go / EAS build) ─────────────────────────────┐
│  UI (expo-router screens)  →  zustand stores  →  services  →  bundled JSON assets        │
│      app/**                     src/stores/**      src/services/**   assets/**            │
│                                     │  persist                                            │
│                                     ▼                                                     │
│                     AsyncStorage (prefs, reading, userData) + SecureStore (auth)          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
                   ┆ (proposed, not wired)
                   ▼
        Railway: Express + Prisma + Postgres  (backend/)  — accounts + sync
```

## Runtime components `[current]`
- **Navigation/shell:** `expo-router` v4. `app/_layout.tsx` sets the auth gate (`initialize()` restores session; redirect login/tabs) + theme-aware StatusBar/background. Tab group `(tabs)`; auth group `(auth)`; modal-ish reader `read/[passage]`.
- **Theme:** `src/lib/theme.ts` — single source of truth reading `settingsStore.theme`; `useTheme()` returns `{theme, isDark, mode}`; screens/components style via inline theme objects.
- **State (zustand + persist):**
  - `authStore` — session (no persist; hydrated from SecureStore via `authService`).
  - `settingsStore` — prefs (persist: `davar-settings`).
  - `readingStore` — plan pointer, streak, completedDays (persist: `davar-reading`).
  - `userDataStore` — highlights/notes/bookmarks (persist: `davar-user-data`).
- **Services (domain logic):** `bibleService` (in-memory text), `planCatalog` (pure plan reader), `authService`+`authClient` (local hashing/secure store), `notificationService` (expo-notifications), `audioService` (expo-speech TTS), `lexiconService`/`strongsService`/`strongsSearchService` (word study), `syncService` (server sync — inactive).
- **Data:** `assets/**` bundled JSON, loaded via `require` (heavy translations lazy-loaded on first use).

## Data flow (daily loop) `[current]`
`readingStore.currentPlan` → `planCatalog.getPlanDay(id, currentDay)` → Home renders passages → tap → `read/[passage].tsx` parses slug → `bibleService.getChapter` → `ChapterView` → "Mark Complete" (`?planDay`) → `readingStore.completePlanDay` (advances plan + streak via pure `utils/streak`) → persisted.

## Integration boundaries
- **App ↔ bundled data:** synchronous in-memory reads (`bibleService`, `planCatalog`). Boundary: keep heavy JSON behind lazy `require`. `[current]`
- **App ↔ device storage:** AsyncStorage (prefs/progress/annotations) + SecureStore (auth). `[current]`
- **App ↔ backend:** `syncService` HTTP to `EXPO_PUBLIC_API_URL`. **Contract mismatch** (client `/api/sync/*` GET vs backend `/sync/*` POST) — must be reconciled before enabling. `[current — inactive]`

## Local development path
`npm install` → `npx expo start` → open in Expo Go (works because only standard Expo modules are used). Web smoke: `npx expo export -p web`.

## Deployment path
EAS Build (`eas.json`) → `preview` (internal) / `production` → store submit (`eas submit`, iOS config present). Backend: Railway Docker.

## Security / privacy boundaries `[current]`
- Passwords: salted, iterated SHA-256 (`authService`, `HASH_ITERATIONS=120`); stored in **SecureStore** (encrypted at rest), AsyncStorage fallback on web only.
- No PII leaves the device in the MVP (no analytics, no network for core flows).
- Session token is a local random; no server trust yet.

## Key decisions and alternatives
1. **Inline `useTheme()` styling over NativeWind `dark:` variants.** Chosen: proven-in-repo, deterministic, no silent class misses. Alt: CSS-variable theming (less code, unverified on native). `[current]`
2. **Offline-local auth over server auth for MVP.** Chosen: works in Expo Go, unit-testable, no backend dependency. Alt: wire Railway backend (needs reachable server; deferred to P2). `[current]`
3. **New pure `planCatalog` over the bundled SQLite `planService`.** Chosen: the SQLite layer (`database.ts`) was never initialized (dead); pure JSON reader is testable and simple. Alt: initialize SQLite (heavier, still needed if sync adopts it). `[current]`
4. **zustand + AsyncStorage as the persistence spine; SQLite left dormant.** The dead SQLite layer still exists, so full removal is blocked until sync is refactored (T-203). `syncService` now **lazy-loads** `expo-sqlite` and its `init()` catches failures, so importing it can't crash a screen. `[current]`
5. **Native modules must never crash the UI.** `expo-haptics` is used through `src/utils/haptics.ts` (no-ops where unsupported, swallows errors) and `expo-sqlite` is lazy + guarded. Rule: any native capability that can be absent (haptics, sqlite, notifications) is accessed defensively. `[current]`
