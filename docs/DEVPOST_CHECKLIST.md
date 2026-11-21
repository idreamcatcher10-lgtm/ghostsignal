# Kiroween 2026 — honest submission checklist

**Project:** GhostSignal. **Category:** Resurrection. **Status:** public GitHub source, passing CI (11 tests), and successful GitHub Pages deployment; device testing and judge video pending; no genuine Kiro development yet.

## Before final submission

- [ ] Actually use Kiro for significant implementation work, tests/refactors or an enhancement. Save authentic Kiro artifacts and explain actual use, not prospective plans.
- [x] Public GitHub repository (https://github.com/idreamcatcher10-lgtm/ghostsignal) with LICENSE and `.kiro` at the repository root.
- [x] Static HTTPS application URL: https://idreamcatcher10-lgtm.github.io/ghostsignal/ (GitHub Pages deployment reported success; HTTP smoke verification is automated separately). Keep it available through judging.
- [ ] Test on physical devices (offline, camera support limitations) and update descriptions accordingly.
- [ ] Public YouTube demonstration under 3 minutes, actually showing a functioning phone/PWA and explaining real Kiro use.
- [ ] Devpost Project Story (problem, solution, how it works, implementation decisions, challenges and next steps).
- [ ] Devpost 'Built With' reflects actual stack (TypeScript, HTML, CSS, Service Worker, IndexedDB, BarcodeDetector, bundled jsQR fallback, Kiro **only after use**). Do NOT list React, Vite or Web Crypto unless later added.
- [ ] Extra award eligibility verified truthfully (startup founder/LinkedIn, student eligibility, Kiro Crew app, 2025 registration, etc.).
- [ ] All application/contact fields and jurisdiction/age answers accurately answered.
- [ ] Confirm the project was created during the submission period. Keep third-party open-source QR library license notices, and disclose any genuinely pre-existing non-standard code or work if applicable under the official rules.

## Optional Devpost project summary draft

> GhostSignal reimagines the 1990s pager as an offline-first Progressive Web App. Users compose short messages, convert them to QR packets, and physically relay them between devices, even when Internet access isn't available. Locally stored messages, expiration times, duplicate detection and relay limits keep the experience manageable. GhostSignal is deliberately human-carried, not a wireless mesh network, and is a hackathon prototype rather than an emergency service.

## Technical testing instructions (only once tested)

> Open the deployed HTTPS PWA on two devices while connected. Wait for caching to finish. Enable airplane mode, compose an SOS message on Device A, and generate its QR. On Device B, use Receive / Scan in a supporting browser, or import the raw GS1 code via the manual fallback. View the received message and tap Relay as QR. Scan the new QR on Device C. The ID remains stable; the hop count increments. No account or login credentials are required.
