# 12 — Screen Acceptance Matrix

Status values: `verified` (evidence attached), `connected` (wired + navigable), `implemented` (built), `needs-update`, `not-connected`, `missing`, `blocked`.

Cross-reference code/tests in `13-code-and-test-map.md`.

| ID | Screen | Spec (10-page) | Code file | Navigation | Data/API | Required states | Tests / evidence | Status | Issues / required updates | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S-01 | Auth gate | §S-01 | `app/_layout.tsx` | root | `authStore.initialize` | loading | web smoke boot (0 fatal) | connected | — | P0 |
| S-02 | Login | §S-02 | `app/(auth)/login.tsx` | from gate | `authStore.login` | idle/loading/error | authService unit (11); runtime login screen render | connected | add component test | P0 |
| S-03 | Register | §S-03 | `app/(auth)/register.tsx` | from login | `authStore.register` | idle/loading/error | runtime register→home flow (0 fatal) | verified | — | P0 |
| S-04 | Forgot pw | §S-04 | `app/(auth)/forgot-password.tsx` | from login | `authService.resetAccount` | idle/busy | authService.resetAccount unit | connected | — | P1 |
| S-05 | Home | §S-05 | `app/(tabs)/index.tsx` | tab | `readingStore`,`planCatalog`,`getVerseOfDay` | no-plan/plan | runtime home render; planCatalog+streak units | verified | — | P0 |
| S-06 | Read | §S-06 | `app/(tabs)/read.tsx` | tab | `bibleService`,`bookSlug`,`referenceParser` | empty/results | bookSlug(5)+referenceParser(9) units; runtime plans-nav via home | connected | add search integration test | P0 |
| S-07 | Plans | §S-07 | `app/(tabs)/plans.tsx` | tab | `planCatalog`,`readingStore` | active/none | runtime plans render; planCatalog units | verified | — | P0 |
| S-08 | Settings | §S-08 | `app/(tabs)/settings.tsx` | tab | settings/reading/sync/notif | all rows | reminderTime units (6) | connected | notif permission E2E on device (pickers now modal — T-103 done) | P0 |
| S-09 | Reader | §S-09 | `app/read/[passage].tsx` | push from Home/Read/Plans | `bibleService`,`readingStore`,`userDataStore` | loading/error/not-found | referenceParser units; runtime deep-link render (0 fatal) | connected | push/replace + persisted mark-complete (T-105); verse-scroll done (T-102) | P0 |
| M-01 | Word Detail | §M-01 | `src/components/study/WordDetailModal.tsx` | reader word tap | strongs/lexicon | loading/empty | manual | connected | a11y done (T-101) | P1 |
| M-02 | Strong's Search | §M-02 | `src/components/study/StrongsSearchModal.tsx` | word detail | strongsSearchService | loading/empty | manual | connected | a11y done (T-101) | P1 |
| M-03 | Highlight menu | §M-03 | `src/components/study/HighlightMenu.tsx` | verse long-press | userDataStore | — | manual | connected | a11y done (T-101); swipe-to-dismiss pending | P1 |
| M-04 | Note editor | §M-04 | `src/components/study/NoteEditor.tsx` | highlight menu | userDataStore | edit/new | manual | connected | a11y done (T-101) | P1 |
| M-05 | Audio controls | §M-05 | `src/components/reading/AudioControls.tsx` | reader header | audioService | playing/paused | manual device | connected | inset offset | P1 |
| M-06 | Chapter picker | §M-06 | `app/(tabs)/read.tsx` (Modal) | book tap | bibleService meta | — | runtime | connected | — | P0 |

## Cross-cutting acceptance (all screens)
- Dark mode: every primary screen re-themes on Settings→Theme. `verified` (theme is single-source; runtime boot both paths). Study modals already used `useTheme`. `connected`.
- Safe-area: tab bar, reader bottom bar, sheets padded. `connected` (audio offset pending).
- No dead controls on primary surfaces. `verified` (bookmark wired; guest backdoor removed).

## Agent gate (before UI build packets)
Page inventory ✅ · per-screen specs ✅ · acceptance rows for every screen ✅ · code+test map ✅ · nav/ownership explicit ✅ · correction preflight translated into packet ✅ (see `09-correction-preflight.md`).
