# Davar — Critical Design & Production-Readiness Review

_Reviewed: 2026-07-08 · Scope: `app/`, `src/`, `backend/`, design tokens & assets_

## Verdict

Davar has a **genuinely strong foundation**: real Bible data (7 translations + Hebrew/Greek + Strong's, ~38 MB bundled), a working interlinear reader with word-study, TTS audio, a real reading-store/streak model, and a clean reusable component layer (`Button`, `Card`, `Input`) that is properly theme-aware. The visual language (navy + gold, serif scripture, generous line-height) is tasteful and on-brand.

However, **it is not production-grade today.** Several headline features are advertised in the UI and settings but are wired to nothing or to the wrong place. The most damaging pattern is *"looks done, isn't done"*: controls that render perfectly but do nothing when tapped. These erode trust faster than missing features. This review catalogs every issue found across three independent audits (theming, data/state, UX/a11y), de-duplicated and prioritized.

**Severity legend:** 🔴 Critical (broken / blocks ship) · 🟠 High · 🟡 Medium · ⚪ Low

---

## 1. Broken or non-functional features ("not working")

These are the things that appear to work but don't. Fix these first — they are correctness bugs, not polish.

| # | Sev | Issue | Evidence | Fix |
|---|-----|-------|----------|-----|
| 1 | 🔴 | **Theme picker did nothing.** Two disconnected theme systems: Settings wrote `settingsStore.theme`, but `useTheme()` read a *separate* `useThemeStore` whose `setMode` was never called anywhere. Dark mode could not be selected. | `theme.ts` (old `useThemeStore`), `settings.tsx:224-231`, `settingsStore.ts:103` | **✅ Fixed in this PR** — `useTheme()` now reads `settingsStore.theme`; dead store removed; StatusBar/root background made theme-aware. |
| 2 | 🔴 | **Auth is entirely simulated.** `login`/`register` `setTimeout(500)` then fabricate a user; any email/password "succeeds," passwords never checked. A complete real backend (bcrypt + JWT + Prisma) exists but is never called. | `authStore.ts:33-80`; `backend/src/routes/auth.ts` | Point `login`/`register` at the backend; store real JWT; handle failures. |
| 3 | 🔴 | **Sync is non-functional on three axes.** (a) The `queue*Sync` enqueue helpers are never called by any store, so `pendingCount` is always 0; (b) client hits `/api/sync/<entity>` (GET pull) but backend mounts `/sync/push`, `/sync/pull` (POST) — every request 404/405s; (c) it sends `Bearer local-token`, which the backend rejects. "Sync Now" reports success while transmitting nothing. | `syncService.ts:224,320,384-432`; `backend/src/index.ts:60-61`; `settings.tsx:59-76` | Align route shapes + method; call enqueue from `userDataStore`/`readingStore`; use real token. |
| 4 | 🔴 | **The entire SQLite layer + `planService` are dead code.** `initDatabase()` is never invoked, so `getDatabase()` would throw. All of `database.ts` and `planService` (plan schedules, reading logs) is orphaned; the app persists only via zustand + AsyncStorage. Two parallel, unreconciled data models. | `database.ts:20`; `planService.ts` | Decide one persistence model. If keeping zustand, delete the DB layer; if keeping SQLite, initialize it and route reads/writes through it. |
| 5 | 🟠 | **Reading plans are cosmetic.** The Plans screen hardcodes 6 plans whose IDs don't match the 3 real bundled plan JSONs. Starting a plan stores only metadata + `currentDay:1` — no schedule is attached, so a day's passages can never be derived. The 118 KB `bible-1-year.json` schedule is never surfaced. | `plans.tsx:22-104`; `assets/plans/*.json` | Load real plans via `planService`; attach the schedule; derive Today's passages from it. |
| 6 | 🟠 | **Completing a reading never advances the plan.** `handleMarkComplete` calls `markTodayComplete` (streak only) but never `markDayComplete`, so `completedDays` stays `[]` and `currentPlan.currentDay` is frozen at 1 forever. The home progress bar can never move. | `read/[passage].tsx:307-312`; `readingStore.ts:55` | Call `markDayComplete` on completion; tie completion to the plan's current day. |
| 7 | 🟠 | **Notifications toggle is a no-op.** `expo-notifications` isn't even a dependency. "Daily Reminders" persists a flag that schedules nothing. | `settingsStore.ts:75-76`; `package.json` | Add `expo-notifications`; schedule/cancel a daily local notification from the toggle + `dailyReminderTime`. |
| 8 | 🟡 | **Dead bookmark button** in the reading header — a `TouchableOpacity` with no `onPress`. Looks identical to working controls. | `read/[passage].tsx:494-496` | Wire it (toggle bookmark for the chapter) or remove it. |
| 9 | 🟡 | **Home content is hardcoded demo data.** "Today's Reading" and "Verse of the Day" are always Psalm 23 regardless of the active plan; both Start buttons route to `/read/psalm-23`. | `index.tsx:37-43,190-198` | Derive from the active plan / a real VOTD source. |
| 10 | 🟡 | **"Days Complete" stat is mislabeled** — shows `currentPlan.currentDay` (a position pointer), not `completedDays.length`. | `index.tsx:159-165` | Use the real completed count. |
| 11 | 🟡 | **Read-tab search is misleading.** Placeholder says "Search books or passages…" but it only filters book *names* — "John 3:16" or "love" yields "No books found." Real full-text `bibleService.search()` exists but is unused. No chapter picker either: tapping a book jumps to chapter 1, leaving most of the Bible unreachable. | `read.tsx:79-88,99` | Wire reference parsing + `bibleService.search`; add a chapter grid. |
| ⚪ | ⚪ | Forgot-password always shows the success screen without calling the backend; "Continue as Guest" testing backdoor ships in the production login. | `forgot-password.tsx:19-27`; `login.tsx:126-139` | Wire/gate before release. |

---

## 2. Design system & theming

The design *intent* is good; the *implementation* has drift and a broken dark mode.

- 🔴 **Two divergent palettes.** `tailwind.config.js` and `src/lib/theme.ts` both define the color system and disagree — dark bg `#1A1A1A` vs `#121212`, body text `#2D2D2D` vs `#1A1A1A`, "muted" `#6B7280` (used by every hardcoded screen) vs `#5C5C5C` (used by components). The same semantic token renders differently depending on which screen you're on. **Establish one source of truth** (generate Tailwind colors from `theme.ts`, or delete the unused Tailwind dark tokens).
- 🟠 **Tab/auth screens are light-only.** `index/read/plans/settings` + all auth screens use static NativeWind classes (`bg-white`, `bg-background`, `text-muted`) with **zero `dark:` variants** and never import `useTheme`. In dark mode the reader flips dark while these stay white — a split-personality UI. **Convert these screens to `useTheme()` inline styles** (as the reader already does) — this is the largest remaining chunk of the dark-mode work.
- 🟠 **`darkMode: 'class'` is a no-op in React Native** (it toggles a DOM class that doesn't exist on native). Remove it; if you want an explicit override to also drive NativeWind classes, call NativeWind's `setColorScheme()` when `theme` changes.
- 🟠 **Tab bar & nav chrome hardcoded** (`_layout.tsx:10-27`) — white tab bar stays white under dark content.
- 🟡 **Contrast failures (WCAG AA):**
  - Gold `#C9A227` as *foreground text* (verse numbers) on white ≈ **2.4:1** (needs 4.5:1). Use a darker gold (`#796117` ≈ 4.6:1) or navy for text; reserve `#C9A227` for fills/icons. (`theme.ts:198`, `VerseText.tsx:141`)
  - `white/70` sub-labels on the light end of the header gradient ≈ **4.4:1** — under AA. Bump to `white/85`+. (`index.tsx:70,83`; `settings.tsx:293`)
- 🟡 **Red-letter text hardcoded** `#DC2626` on both themes — weaker contrast in dark mode; use the themed `theme.error`. (`VerseText.tsx:103`)
- ⚪ **Icon/Switch colors hardcoded** (`#1E3A5F`, `#9CA3AF`, …) throughout screens instead of routing through `useTheme()`.

---

## 3. UX & interaction

- 🟠 **`Alert.alert` used as a picker — and broken on Android.** Default-Translation and Theme present 4–5 buttons in an `Alert`; Android reliably renders only 3 and reorders them. Well-built `TranslationPicker` and `FontSizeControl` modals already exist but are never wired in. **Replace Alert pickers with the existing modals / an ActionSheet.** (`settings.tsx:170-177,225-231`)
- 🟠 **"Tap-to-cycle" controls with no affordance or reverse.** Translation badge silently cycles KJV→ASV→BBE→BSB; interlinear language, font size, and audio speed all cycle on tap. Users can't see options or go back. Use segmented controls / menus. (`read/[passage].tsx:315-320`; `settings.tsx:158-163`)
- 🟠 **Weak forms.** All validation errors go through `Alert.alert`; no inline field errors, no email-format validation, password rule checked only on submit. The reusable `Input` already supports an `error` prop but auth screens use raw `TextInput`. (`login.tsx`, `register.tsx`)
- 🟠 **Touch targets below 44×44.** Reading-header buttons (`p-2` ≈ 28–38 px), header bookmark (bare 22 px glyph), translation badge (`px-2 py-1`), password eye toggles, audio transport (40 px). Add `hitSlop` / min sizing. (`read/[passage].tsx:462-496`)
- 🟡 **`push` vs `replace` inconsistency corrupts Back.** Chapter paging uses `replace` (Back skips previous chapters); cross-refs use `push` despite a comment saying otherwise (stacks deeply). Pick one model. (`read/[passage].tsx:236,288`)
- 🟡 **Verse deep-links silently drop the verse.** `john-3-16` → John 3 with no scroll-to-verse and no indication. (`read/[passage].tsx:64-116`)
- 🟡 **Decorative drag-handles imply swipe-to-dismiss** but no bottom sheet implements a pan gesture; dismiss is backdrop/button only. (`HighlightMenu.tsx:94`, et al.)
- 🟡 **Safe-area hardcoded** (`paddingBottom:32`, audio `bottom:80`, tab `height:64`) instead of `useSafeAreaInsets` — crowds the home indicator.
- 🟡 **Mixed iconography** — Ionicons vs raw emoji (📝🔖🗑️→) that render per-platform, aren't tintable, and read poorly to screen readers.
- 🟡 **"Mark Complete" is local component state** — the checkmark resets when you page away and back; not persisted per passage.
- ⚪ Nested touchables on the Home card (RN warning + double-activation); double Alert on plan start; ChapterView always shows both swipe hints even at Genesis 1 / Revelation 22.

---

## 4. Accessibility (currently near-zero)

A repo-wide grep for `accessibility*` returns **2 hits total**, both in an unused component. For App Store / Play Store quality this is the biggest gap after dark mode.

- 🔴 **Icon-only buttons have no labels** — reading-header controls, password toggles, search clear, all modal close buttons, audio transport. Screen readers announce nothing useful.
- 🔴 **No `accessibilityRole="button"`** on dozens of `TouchableOpacity`s.
- 🟠 **No Dynamic Type support** — UI chrome uses fixed pixel sizes; the in-app font control only affects verse body text. Respect OS font scaling (`allowFontScaling`, `maxFontSizeMultiplier`).
- 🟠 **Modals lack `accessibilityViewIsModal`** and focus management.

**Fix:** add `accessibilityRole` / `accessibilityLabel` / `accessibilityHint` to every icon/emoji-only control; mark modals; honor font scaling. This is mechanical and high-leverage.

---

## 5. Security & production hygiene

- 🔴 Real auth not wired (§1.2) — currently anyone is "logged in."
- 🟡 **Token stored in AsyncStorage (unencrypted)** rather than `expo-secure-store`. Harmless while the token is fake, insecure once real JWTs land. (`authStore.ts:102-108`)
- 🟡 **Misleading iOS permission string** — `NSMicrophoneUsageDescription` is declared, but the app uses TTS *output* (`expo-speech`), not the microphone. Remove it to avoid App Store review friction. (`app.json:24`)
- 🟡 **Sync base URL mismatch** — `syncService` defaults to `davar-api.railway.app` while `.env.example` says `davar-backend-production.up.railway.app`.
- ⚪ Guest/testing backdoors and stubbed forgot-password ship in the build (§1).

---

## Prioritized remediation roadmap

**P0 — Make advertised features real (ship-blockers)**
1. ✅ Theme picker works (this PR). Next: convert tab/auth screens to be theme-aware so dark mode is coherent app-wide (§2).
2. Wire real auth to the existing backend; store JWT in SecureStore (§1.2, §5).
3. Fix or hide sync until the client/backend contract matches (§1.3).
4. Connect plans → Today's reading → completion → progress as one flow (§1.5, §1.6, §1.9).
5. Remove/gate testing backdoors (guest login, stub forgot-password).

**P1 — Production polish**
6. Accessibility pass (§4) — labels, roles, Dynamic Type.
7. Replace Alert-based pickers & tap-to-cycle with the existing modal components (§3).
8. Fix search + add a chapter picker (§1.11); wire the dead bookmark button (§1.8).
9. Contrast fixes for gold text and gradient sub-labels (§2).
10. Add `expo-notifications` and make the reminder toggle real (§1.7).

**P2 — Hardening & consistency**
11. Single palette source of truth; delete dead SQLite layer or adopt it fully (§2, §1.4).
12. Safe-area insets, navigation `push`/`replace` model, persisted "Mark Complete," consistent iconography (§3).
13. Clean up misleading iOS permission + sync URL (§5).

---

## Fixed in this PR

- **Theme system unified.** `useTheme()` now reads the mode from `useSettingsStore` (the single, persisted source the Settings screen already writes to). The dead duplicate `useThemeStore` is removed. The root layout's `StatusBar` and background now follow `isDark`. Result: the Settings **Theme picker actually controls the app** for every themed surface (the reader, all study modals, and shared components) and the status bar renders correctly in dark mode — a previously dead control is now live.

This is intentionally scoped to the one fix that is fully self-contained and verifiable. The remaining items above are laid out as an actionable roadmap rather than changed in a single sweeping commit.
