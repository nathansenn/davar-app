# 01 — Product Scope

## Primary workflows `[current]`
1. **Onboard / sign in** — register (name/email/password) or sign in; local account, offline.
2. **Pick a reading plan** — browse plans, start one (becomes active).
3. **Daily reading loop** — Home shows today's passages → open reader → read → "Mark Complete" → plan day + streak advance.
4. **Free reading / search** — browse books, jump to a reference ("John 3:16"), full-text word search, pick a chapter.
5. **Study a word** — tap a word → Strong's number, lemma, transliteration, definition, cross-references; search a Strong's number across scripture.
6. **Interlinear** — toggle Hebrew (WLC) / Greek (TR) beneath the English text.
7. **Listen** — TTS audio playback of a chapter with per-verse highlight and speed control.
8. **Annotate** — long-press a verse to highlight (6 colors), bookmark, or attach a note.
9. **Personalize** — theme (light/dark/system), font size, translation, verse numbers, original-language options, daily reminder time.
10. **Track progress** — streak, longest streak, total days, plan progress; verse of the day.

## User roles
- **Single end user** (device-local). No admin/provider/multi-tenant roles in the MVP. `[current]`
- Future: authenticated cloud user with cross-device sync. `[proposed]`

## MVP slice (proves the spine) `[current — implemented]`
Auth (local) → active plan → today's passage → reader (text + verse actions) → mark complete → streak/progress persisted across restarts. Proves ingestion (bundled JSON), state (zustand+persist), UI (expo-router), persistence (AsyncStorage/SecureStore), and verification (jest + web smoke).

## Later slices
- Server-backed accounts + cross-device sync (backend exists). `[proposed]`
- Verse-scroll deep-linking + parallel translations + red-letter. `[proposed]`
- Reading-plan catalog expansion + custom plans. `[proposed]`
- Widgets / home-screen streak, push reminders with deep links. `[proposed]`

## Content / assets / data needed `[current — present]`
- Bundled translations: KJV, ASV, BBE, BSB (English); WLC (Hebrew), TR (Greek); BYZ present but unreferenced.
- Strong's Hebrew + Greek lexicons + frequency index.
- 3 reading plans (bible-1-year, new-testament-90, psalms-proverbs).
- Book metadata (66 books, chapter/verse counts).
- App icons, splash, adaptive icon.

## Explicit out-of-scope (MVP)
- Community/social, IAP, web product surface, live sync, multi-user, cloud backup UI, audio from pre-recorded narration (TTS only).
