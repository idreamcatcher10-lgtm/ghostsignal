# GhostSignal QA status — November 2026

## Verified in this build

- `npm run build`: passes with TypeScript strict checking.
- `npm test`: 10/10 protocol unit tests pass as of package generation.
- Browser vendor bundle loads in an isolated JavaScript runtime (`node:vm`).
- Original QR generation library successfully produced the ASCII GS1 payload matrix (65×65 modules) for the demo SOS message.
- QR matrix was rendered into a PNG and **independently decoded using OpenCV QRCodeDetector**; decoded text exactly matched `encodePacket()` output (255 characters in test).

## Not yet verified — manual tests required

- Physical camera scanning on Android Chrome, Safari iOS and other mobile browsers.
- Browser offline reload on a physical phone after service-worker installation.
- Two/three physical devices passing QR packets under airplane mode.
- PWA install banners and notification UI differences among devices.
- Accessibility with screen reader and external keyboard.

Note: This tool environment's managed Chromium browser was blocked from navigating to local web addresses by administrator policy. Therefore, no browser-driven UI integration pass or genuine browser screenshots are claimed. The core protocol/unit tests and independent QR decoding were run successfully.

## Manual test worksheet

| Test | Expected | Result |
|---|---|---|
| App loads over HTTPS | No JS console errors | Not run |
| Send normal + SOS packets | QR produced, saved locally | Not run on physical devices |
| Import packet | Appears in inbox | Not run on physical devices |
| Import duplicate | Rejected with message | Not run on physical devices |
| Scan camera (supported browser) | QR decoded | Not run |
| Airplane mode reload | UI available without requests | Not run |
| Offline relay between three devices | Same ID, hops increments | Not run |
| Expired packet | Rejected | Unit tested |
| Limit 6 relays | New relay rejected | Unit tested |

## Additional browser UI QA after initial report

The UI was also exercised in headless Chromium by injecting the exact compiled HTML/CSS/JS into an `about:blank` document with a simulated `localStorage`, to work around the managed Chromium URL policy. The following passed with no page-script errors:

- Render desktop (1440px) and mobile (390px) views.
- Fill the demo message, generate a live QR and see the saved-count telemetry change.
- Decode the full-resolution app-generated canvas QR using OpenCV; decoded payload began with `GS1.` and matched the protocol.
- Open a local message, relay it, and observe hop count `1 / 6`.
- Simulate independent browser instances A, B and C: export from A, import into B, relay in B, import into C, and reject duplicate re-import by stable ID.
- Open mobile large-QR dialog with a QR image sized for camera scanning.

**Qualification:** This proves browser UI logic with injected local assets and simulated storage, **not** real hosted-origin IndexedDB/service worker/camera operation. The manual physical-device checklist remains required before competition submission.