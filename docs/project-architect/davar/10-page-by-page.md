# 10 — Page by Page

Status legend: `implemented` (built + wired), `partial` (built, known gaps), `stub` (placeholder). Source label: `[current]` = verified against code.

## Inventory

| ID | Screen / Surface | Role group | Route / Entry | Purpose | Status | Code file | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S-00 | Entry redirect | Shell | `app/index.tsx` | Route to tabs/login | implemented | `app/index.tsx` | P0 |
| S-01 | Auth gate + shell | Shell | `app/_layout.tsx` | Session restore, redirects, theme/StatusBar | implemented | `app/_layout.tsx` | P0 |
| S-02 | Login | Auth | `/(auth)/login` | Sign in | implemented | `app/(auth)/login.tsx` | P0 |
| S-03 | Register | Auth | `/(auth)/register` | Create local account | implemented | `app/(auth)/register.tsx` | P0 |
| S-04 | Forgot password | Auth | `/(auth)/forgot-password` | Local account reset | implemented | `app/(auth)/forgot-password.tsx` | P1 |
| S-05 | Today (Home) | End user | `/(tabs)` | Streak, today's reading, VOTD, quick actions | implemented | `app/(tabs)/index.tsx` | P0 |
| S-06 | Read / Browse | End user | `/(tabs)/read` | Book list, search, chapter picker | implemented | `app/(tabs)/read.tsx` | P0 |
| S-07 | Plans | End user | `/(tabs)/plans` | Browse/start plans, active progress | implemented | `app/(tabs)/plans.tsx` | P0 |
| S-08 | Settings | Settings | `/(tabs)/settings` | Prefs, theme, notifications, sync, data | implemented | `app/(tabs)/settings.tsx` | P0 |
| S-09 | Reader | End user | `/read/[passage]` | Chapter text, interlinear, audio, verse actions | implemented | `app/read/[passage].tsx` | P0 |
| M-01 | Word Detail modal | Study | over reader | Strong's/lemma/def/cross-refs | partial (a11y) | `src/components/study/WordDetailModal.tsx` | P1 |
| M-02 | Strong's Search modal | Study | over reader | Search a Strong's # across Bible | partial (a11y) | `src/components/study/StrongsSearchModal.tsx` | P1 |
| M-03 | Highlight menu | Study | verse long-press | Highlight color / bookmark / note | partial (a11y, swipe) | `src/components/study/HighlightMenu.tsx` | P1 |
| M-04 | Note editor | Study | from highlight menu | Write/edit/delete note | partial (a11y) | `src/components/study/NoteEditor.tsx` | P1 |
| M-05 | Audio controls | Reading | reader header | TTS transport + speed | implemented | `src/components/reading/AudioControls.tsx` | P1 |
| M-06 | Chapter picker | End user | Read tab book tap | Choose chapter | implemented | `app/(tabs)/read.tsx` (inline Modal) | P0 |

---

## Per-screen specs (behavioral)

### S-02 Login `[current]`
- **Purpose/role:** unauthenticated user signs in. **Entry:** default redirect from gate. **Exit:** success → `/(tabs)`; links → register / forgot.
- **Data/state:** local `email/password/showPassword/error`; `authStore.login`. **Persistence:** SecureStore session on success.
- **Actions/validation:** email format (`isValidEmail`) + non-empty password; submit → `authService.login` → typed error banner (`NO_ACCOUNT`/`BAD_CREDENTIALS`).
- **States:** idle / loading (spinner) / error banner. No offline dependency.
- **A11y:** input labels; password show/hide labeled + hitSlop. **Acceptance:** wrong password shows "Incorrect email or password"; correct → home. **Evidence:** runtime flow harness (register path exercised).

### S-03 Register `[current]`
- Fields name/email/password/confirm; validation `name` required, `isValidEmail`, `passwordProblem` (≥8), match. Success → session + `/(tabs)`. Inline error banner. Removed the old guest/"Skip Auth" backdoor.

### S-04 Forgot password `[current]`
- Honest local reset: explains device-local account; "Reset Account" (destructive confirm) → `authService.resetAccount()` → `/(auth)/register`. Reading progress kept (separate store). (Was a stub that always "succeeded".)

### S-05 Today / Home `[current]`
- **Sections:** gradient greeting + streak card; Today's Reading card (plan-derived passages, est. minutes, progress bar, Start/Continue); quick stats (streak, completedDays.length); quick actions (Plans, Read); Verse of the Day (deterministic, real text).
- **Data:** `readingStore` (streak, currentPlan, completedDays), `planCatalog.getPlanDay`, `getVerseOfDay`. `updateStreak()` on mount.
- **States:** no active plan → "Browse Plans" CTA. **Actions:** Start Reading → `/read/{slug}-{ch}?planDay={currentDay}`.
- **Acceptance:** with active plan, card shows the current day's passages and progress %; VOTD rotates by day-of-year.

### S-06 Read / Browse `[current]`
- **Sections:** search bar; testament tabs (All/OT/NT derived from canonical order); jump-to-reference card; verse search results (`bibleService.search`, len ≥ 3); book grid; chapter-picker modal.
- **Actions:** book tap → chapter picker (1-chapter books go direct); reference/verse result → reader (`?verse`). Empty state on no results.
- **Acceptance:** "John 3:16" shows a Go-to card; "love" returns verse matches; picking a chapter opens it.

### S-07 Plans `[current]`
- Active-plan banner (progress + Continue → current-day passage); plan cards from `planCatalog.getPlans()` with Day-1 preview; Start (single confirm) → `readingStore.setCurrentPlan`.
- **Acceptance:** starting a plan makes it active; Home reflects Day 1; Continue opens the right passage.

### S-08 Settings `[current]`
- Sections: Account, Reading (font size, translation, verse numbers), Original Languages, Appearance (theme), Notifications (reminders toggle + time), Sync, Data & Privacy (reset, sign out).
- Theme now actually drives the app; notifications toggle requests permission + schedules; reminder-time row cycles presets. Sync reports honestly. Sign out clears SecureStore session.

### S-09 Reader `[current]`
- **Header controls:** interlinear toggle (עב/ελ), translation cycle badge, audio toggle, chapter bookmark (wired). All labeled + hitSlop.
- **Body:** `ChapterView` (verse text or interlinear); tap word → Word Detail; long-press verse → Highlight menu.
- **Bottom bar:** Prev / Mark Complete / Next (safe-area padded). `?planDay` → `completePlanDay`; else `markTodayComplete`.
- **Gaps:** `?verse` deep-link does not auto-scroll yet; chapter nav uses `replace` (back returns to browse). `[proposed — P1]`
- **States:** loading / error / not-found. **Acceptance:** Mark Complete on a plan passage advances plan day + streak and persists.

### M-01..M-04 Study modals `[current — partial]`
- Word Detail: Strong's + lemma + definition + cross-refs + "search Strong's". Strong's Search: results across Bible → navigate. Highlight menu: 6 colors + bookmark + note. Note editor: write/edit/delete.
- **Gaps:** close-button `accessibilityLabel` + `accessibilityViewIsModal`; drag-handles imply swipe-to-dismiss not implemented. `[proposed — P1]`

### M-05 Audio controls `[current]`
- expo-speech TTS: play/pause, prev/next verse, stop, speed cycle, per-verse highlight; labeled. **Gap:** fixed `bottom: 80` offset (not inset-driven). `[proposed]`
