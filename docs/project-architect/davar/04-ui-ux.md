# 04 — UI / UX

## Surfaces and routes (expo-router) `[current]`
| Group | Route | Screen |
| --- | --- | --- |
| root | `app/index.tsx` | Entry redirect |
| root | `app/_layout.tsx` | Auth gate + theme shell |
| (auth) | `/(auth)/login` | Sign in |
| (auth) | `/(auth)/register` | Create account |
| (auth) | `/(auth)/forgot-password` | Local account reset |
| (tabs) | `/(tabs)` → `index` | Today (home) |
| (tabs) | `/(tabs)/read` | Browse / search |
| (tabs) | `/(tabs)/plans` | Reading plans |
| (tabs) | `/(tabs)/settings` | Settings |
| reader | `/read/[passage]` | Chapter reader (+ `?planDay`, `?verse`) |

Detailed per-screen specs: `10-page-by-page.md`. Screen build status: `12-screen-acceptance-matrix.md`.

## Information architecture
Bottom tab bar: **Today · Read · Plans · Settings**. Reading is a pushed stack screen with its own header (interlinear / translation / audio / bookmark controls). Study surfaces (word detail, Strong's search, highlight menu, note editor) are bottom-sheet modals over the reader.

## Design system `[current]`
- **Color:** navy primary `#1E3A5F`, gold secondary `#C9A227`; full light/dark token sets in `src/lib/theme.ts`. Verse-number gold darkened to `#8A6A1F` in light for WCAG AA.
- **Type:** serif (Literata/Georgia) for scripture; sans (Inter/system) for UI. Scripture size scale + user font-size setting.
- **Components:** `common/` Button, Card, Input, LoadingSpinner; `reading/`, `study/`, `home/`.
- **Theming:** every primary surface reads `useTheme()`; controlled by Settings → theme (light/dark/system).

## State & empty states `[current]`
- Reader: loading spinner, error card, not-found.
- Read tab: no-results empty state; jump-to-reference card; verse results.
- Home: "No active plan → Browse Plans" empty state.
- Auth: inline error banners; loading spinners on submit.
- Sync: offline / pending-count / last-synced status.

## Responsive requirements
Portrait phone primary (`orientation: portrait`); tablet supported (`supportsTablet`). Safe-area insets honored on tab bar, reader bottom bar, and sheets. `[current — partially; audio controls still use a fixed offset]`

## Accessibility & locale `[current — partial]`
- Roles/labels/hit-targets on all primary navigation, reader header/bottom bar, and audio controls.
- **Gaps:** study-modal close buttons + `accessibilityViewIsModal`; Dynamic Type for UI chrome. `[proposed — P1]`
- Locale: English UI only; scripture in Hebrew/Greek/English. No i18n framework. `[current]`

## Visual assets and provenance `[current]`
- Icons/splash under `assets/` (`icon.png`, `adaptive-icon.png`, `splash-icon.png`, `icon-1024.png`). Store screenshots not yet produced (`docs/screenshots-needed.md`). `[proposed]`

## Walkthrough scenarios
1. **First run:** launch → login (no account) → "Create one" → register → Home (no plan) → Browse Plans → start "Psalms & Proverbs" → Home shows Day 1 → Start Reading → reader → Mark Complete → streak = 1.
2. **Study:** reader → tap a word → Strong's modal → "Search across Bible" → tap a result → navigate.
3. **Annotate:** long-press verse → highlight green + add note → reopen chapter → highlight persists.
4. **Personalize:** Settings → Theme = Dark → whole app re-themes; enable Daily Reminders → pick time → local notification scheduled.
