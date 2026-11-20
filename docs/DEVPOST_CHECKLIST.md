# Kiroween 2026 — honest submission checklist

**Project:** GhostSignal. **Category:** Resurrection. **Status:** working code package; no public live deployment, no GitHub URL, no judge video, no genuine Kiro development yet.

## Before final submission

- [ ] Actually use Kiro for significant implementation work, tests/refactors or an enhancement. Save authentic Kiro artifacts and explain actual use, not prospective plans.
- [ ] Public GitHub repository with LICENSE visible and `.kiro` at the repository root. Do not put `.kiro` in `.gitignore`.
- [ ] Static HTTPS application URL. Keep it available free for the entire judging period.
- [ ] Test on physical devices (offline, camera support limitations) and update descriptions accordingly.
- [ ] Public YouTube demonstration under 3 minutes, actually showing a functioning phone/PWA and explaining real Kiro use.
- [ ] Devpost Project Story (problem, solution, how it works, implementation decisions, challenges and next steps).
- [ ] Devpost 'Built With' reflects actual stack (TypeScript, HTML, CSS, Service Worker, IndexedDB, BarcodeDetector, Kiro **only after use**). Do NOT list React, Vite or Web Crypto unless later added.
- [ ] Extra award eligibility verified truthfully (startup founder/LinkedIn, student eligibility, Kiro Crew app, 2025 registration, etc.).
- [ ] All application/contact fields and jurisdiction/age answers accurately answered.
- [ ] Pre-existing code disclosure: new hackathon work + vendor QR encoder sourced from qrcode-terminal and any genuinely pre-existing or externally drafted code as required.

## Optional Devpost project summary draft

> GhostSignal reimagines the 1990s pager as an offline-first Progressive Web App. Users compose short messages, convert them to QR packets, and physically relay them between devices, even when Internet access isn't available. Locally stored messages, expiration times, duplicate detection and relay limits keep the experience manageable. GhostSignal is deliberately human-carried, not a wireless mesh network, and is a hackathon prototype rather than an emergency service.

## Technical testing instructions (only once tested)

> Open the deployed HTTPS PWA on two devices while connected. Wait for caching to finish. Enable airplane mode, compose an SOS message on Device A, and generate its QR. On Device B, use Receive / Scan in a supporting browser, or import the raw GS1 code via the manual fallback. View the received message and tap Relay as QR. Scan the new QR on Device C. The ID remains stable; the hop count increments. No account or login credentials are required.
