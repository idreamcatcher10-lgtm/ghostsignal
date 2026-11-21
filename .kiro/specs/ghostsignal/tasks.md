# GhostSignal implementation tasks — Kiro development backlog

**Note:** These checked items were implemented without Kiro. Checked means present in source code, NOT performed by Kiro.

- [x] Create original responsive UI with compose/inbox/receive/guide views
- [x] Implement GS1 wire protocol, checksum and validation
- [x] Implement local QR encoder and PNG export
- [x] Implement indexed local storage and deduplication
- [x] Implement relay flow, max hops and expiry
- [x] Add native browser camera scan where available and manual import fallback
- [x] Add basic PWA service worker + install manifest
- [x] Add protocol unit tests and README
- [ ] **Kiro task:** Open this repo in Kiro and use actual specs/steering to review the architecture
- [ ] **Kiro task:** Choose a substantive improvement (e.g. broader offline scanning support) and have Kiro implement/test it
- [ ] **Kiro task:** Add a real, tested Kiro hook for build/test checks where supported; preserve actual hook config in `.kiro`
- [ ] **Kiro task:** Use Kiro-driven test or PBT scenario; record prompts, results and diffs
- [ ] **Kiro task:** Test camera QR import and offline PWA on 2–3 physical phones
- [ ] **Submission:** Publish to GitHub, deploy HTTPS, record under-3-minute YouTube video, complete Devpost accurately
