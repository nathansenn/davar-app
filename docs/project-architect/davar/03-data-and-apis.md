# 03 — Data and APIs

## Entities and ownership `[current unless noted]`

| Entity | Shape (key fields) | Owner | Persistence |
| --- | --- | --- | --- |
| User/Session | `{id,name,email}` + `{token}` | `authStore` / `authService` | SecureStore (`davar_account`, `davar_session`) |
| Settings | theme, fontSize, translation, verse/original-language flags, notifications, reminderTime | `settingsStore` | AsyncStorage `davar-settings` |
| ReadingPlan (active) | `{id,name,description,durationDays,currentDay}` | `readingStore` | AsyncStorage `davar-reading` |
| Progress | streak, longestStreak, lastReadDate, totalDaysRead, completedDays[] | `readingStore` | AsyncStorage `davar-reading` |
| Highlight | `{id,reference,bookId,chapter,verse,color,createdAt}` | `userDataStore` | AsyncStorage `davar-user-data` |
| Note | `{...,content,updatedAt}` | `userDataStore` | AsyncStorage `davar-user-data` |
| Bookmark | `{...,label?}` | `userDataStore` | AsyncStorage `davar-user-data` |
| Bible text | books → chapters → verses (+ tagged words) | `bibleService` (read-only) | Bundled JSON |
| Plan schedule | `{id,name,durationDays,schedule:[{day,passages:[{bookId,startChapter,endChapter?}]}]}` | `planCatalog` (read-only) | Bundled JSON |
| Strong's entry | `{id,lemma,transliteration,pronunciation,definition,...}` | `strongsService`/`lexiconService` | Bundled JSON |

## Local storage keys `[current]`
- `davar-settings`, `davar-reading`, `davar-user-data` (AsyncStorage, via zustand `persist`).
- `davar_account`, `davar_session` (SecureStore; AsyncStorage fallback on web).

## Internal service contracts (in-app "APIs") `[current]`
- **bibleService:** `getBooks()`, `getChapter(bookId,ch,tr)`, `getVerse(...)`, `search(query,tr,{limit,bookId})`, `getChapterCount(bookId)`, `getOriginalLanguageTranslation(bookId)`. Lazy-loads WLC/TR/BSB.
- **planCatalog (pure):** `getPlans()`, `getPlan(id)`, `getPlanDay(id,day)`, `formatPassages()`, `passageRoute()`, `estimateMinutes()`.
- **authService (pure core):** `register`, `login`, `logout`, `restoreSession`, `resetAccount`, `hasAccount`; helpers `isValidEmail`, `passwordProblem`, `hashPassword`, `safeEqual`. Adapters injected (`CryptoAdapter`, `KVStore`).
- **authClient:** concrete adapters — `expo-crypto` (SHA-256 + secure RNG), `expo-secure-store` (native) / AsyncStorage (web).
- **notificationService:** `configureNotifications()`, `ensurePermission()`, `scheduleDailyReminder(HH:MM)`, `cancelDailyReminder()`.
- **audioService:** expo-speech TTS controller (play/pause/stop/next/prev, rate, per-verse highlight callback).
- **strongsService / lexiconService / strongsSearchService:** lemma lookup, morphology parsing, cross-Bible Strong's search.

## External API contracts (backend — proposed, NOT wired) `[current: mismatch]`
- **Backend routes** (`backend/src/routes`): `POST /auth/register`, `POST /auth/login`, `POST /auth/forgot-password`; `POST /sync/push`, `POST /sync/pull`, `POST /sync/full` (bearer JWT, Prisma `User`/`Session`).
- **Client (`syncService`) currently calls:** `${EXPO_PUBLIC_API_URL}/api/sync/<entity>` and `GET /api/sync/pull`. **Path + method + `/api` prefix mismatch; sends fake token; enqueue helpers never called.** Must be reconciled before enabling (see `06-agent-packets.md` T-201..T-203).
- Base URL: `EXPO_PUBLIC_API_URL` (default `https://davar-backend-production.up.railway.app`).

## Background jobs
- Daily local reminder notification (device-scheduled via `expo-notifications`). `[current]`
- No server jobs in scope. Sync would be event-driven on change + manual "Sync Now". `[proposed]`

## Error handling `[current]`
- Reader: loading / error / not-found states; invalid slug → error screen.
- Auth: typed `AuthError` codes (`INVALID_INPUT`, `NO_ACCOUNT`, `BAD_CREDENTIALS`, `ACCOUNT_EXISTS`) → inline banners.
- Sync: try/catch → "Sync Failed" alert (honest; no false success).

## Observability
- None wired (no analytics/crash reporting). `[current]` → **Gap:** add Sentry/crash + minimal event analytics before store scale. `[proposed]`
