# 11 — Checklists

- **Goal:** take Davar from hardened offline MVP to store-submitted app.
- **Owner:** nathansenn. **Timeline:** driven by P1→P3. **Budget:** Apple Developer ($99/yr, present — ASC app id set), Google Play ($25 one-time), Railway (backend, optional). **DoD:** app live in both stores, daily loop verified on device.

## A. Technical setup / environment
- [x] Install deps, tests + typecheck scripts, scoped tsconfig — *evidence: `package.json`, `jest.config.js`.*
- [ ] Confirm `EXPO_TOKEN` + Apple/Google credentials for EAS. *Blocker if absent → escalate to owner.*
- [ ] Add `.env` with `EXPO_PUBLIC_API_URL` if enabling sync. *Done-when: `expo start` reads it.*

## B. Auth / data / permissions
- [x] Real local auth (hash + SecureStore); backdoor removed. *evidence: `authService.test.ts`.*
- [ ] Server auth + sync (T-201/202/203) *if cloud is in the release.* *Done-when: live round-trip.*
- [ ] iOS/Android permission strings reviewed (mic removed; notifications only). *Done-when: `app.json` minimal + accurate.*

## C. Design / content / a11y
- [x] Dark mode on all primary surfaces; WCAG contrast (verse-number gold, gradient labels). 
- [ ] Study-modal a11y + Dynamic Type (T-101). *Done-when: screen-reader pass.*
- [ ] App icons/splash final; store screenshots per `docs/screenshots-needed.md`. *Done-when: assets in `assets/` + store console.*

## D. QA / device coverage
- [ ] Expo Go device pass (iOS + Android) of all 4 walkthrough scenarios (`04-ui-ux.md`). *Evidence: pass notes here.*
- [ ] Notifications fire at set time on device. 
- [ ] Audio (TTS) plays + per-verse highlight on device.
- [x] `npm run typecheck && npm test && expo export -p web` clean.

## E. Launch / deployment
- [ ] EAS `preview` internal build installs + runs. 
- [ ] EAS `production` build. 
- [ ] Privacy policy + data-safety / privacy-nutrition forms. 
- [ ] `eas submit` (iOS config present in `eas.json`); Play console upload. 
- [ ] Store review passed.

## F. Post-launch operations (recurring)
- [ ] Monitor crash/error (add Sentry — R-09). 
- [ ] Data refresh: re-run `scripts/*` if translations/plans update; re-verify with `scripts/verify-bible-data.js`. 
- [ ] Dependency + Expo SDK upgrades each cycle; re-run full verification gate.

## Final readiness gate
`npm run typecheck && npm test && npx expo export -p web` all clean **AND** on-device Expo Go pass recorded **AND** acceptance matrix has no `missing`/`blocked` on P0 rows.

## Escalation path
Blocked on credentials/backend reachability → owner (nathansenn). Blocked on licensing → confirm Public-Domain status before submit (R-06).
