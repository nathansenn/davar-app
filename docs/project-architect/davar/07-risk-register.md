# 07 — Risk Register

| ID | Risk | Cause | Impact | Early warning | Mitigation | Owner | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-01 | Bundle too large / slow startup | ~38 MB bundled scripture+lexicon loaded via `require` | Slow cold start; store size warnings | Startup jank; export size | Lazy-load heavy translations (already: WLC/TR/BSB); consider on-demand asset download for rarely-used data | Perf | Startup timing on device; export size trend |
| R-02 | Sync ships broken | Client/backend contract mismatch; enqueue never called; fake token | Data loss illusion / silent failure | "Sync Complete" with 0 transferred | Keep sync gated until T-201/202/203; honest failure UI (done) | Integration | Live round-trip test |
| R-03 | Two persistence models drift | Dead SQLite `database.ts` still referenced by `syncService` | Confusion, future data-model split | New code writing to SQLite | Single spine = zustand+AsyncStorage; retire SQLite in T-203 | State | grep for `getDatabase`; single source enforced |
| R-04 | Accessibility gaps fail store/legal bar | Study modals + Dynamic Type incomplete | Rejection / exclusion | Screen-reader dead ends | T-101 + Dynamic Type pass | UI | VoiceOver/TalkBack pass |
| R-05 | Local-only auth misunderstood as cloud | Offline auth has no recovery/email | User locked out, data feels lost | Support requests | Honest forgot-password (done); label clearly; add cloud auth T-202 | Auth | Copy review; T-202 |
| R-06 | Translation/lexicon licensing | Bundled texts must be redistributable | Store/legal takedown | License audit flags | Confirm Public-Domain status per `src/types/ui.ts` before submit | Release | License evidence in T-301 |
| R-07 | Notifications silently off | Permission denied / channel missing | Reminders never fire | Toggle on but no notification | Permission check + revert toggle (done); on-device test | UI | Device notification fires at set time |
| R-08 | EAS/store credentials unavailable | No `EXPO_TOKEN`/ASC access in env | Cannot build/submit | Build auth errors | Confirm credentials early (T-301 dep) | Release | Successful `preview` build |
| R-09 | No crash/error visibility in prod | No Sentry/analytics wired | Blind to field failures | User-reported-only bugs | Add Sentry behind env flag | Ops | Test event in dashboard |
| R-10 | Reader deep-link/nav confusion | `?verse` ignored; chapter nav `replace` sends Back to browse | Users lose place | Complaints; QA notes | T-102 + nav model T-105 | UI | Runtime nav assertions |
