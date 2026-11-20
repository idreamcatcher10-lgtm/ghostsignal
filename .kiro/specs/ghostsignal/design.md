# GhostSignal architecture — prepared before Kiro use

**Status:** External handoff proposal, not Kiro output.

## Data path
1. `src/codec.ts`: typed packet model, construction, serialization, checksum, validation, replay/expiry/hop policies.
2. `src/qr.ts`: locally bundled QR generation, 4-module quiet zone, contrast-preserving canvas output.
3. `src/scanner.ts`: optional browser-native BarcodeDetector camera and image import. Manual text fallback mandatory.
4. `src/store.ts`: IndexedDB object store keyed by packet ID, optionally localStorage.
5. `src/main.ts`: navigation, form, archive, clipboard, toast, import and relay view logic.
6. `sw.js`: shell caching and offline fetch fallback. No background message forwarding.

## Wire protocol
`GS1.<base64url(JSON.stringify([1,id,createdBase36,expiresBase36,priorityIndex,alias,body,hops,maxHops]))>.<CRC32(data)>`

- ID: 9 secure random bytes represented by 18 uppercase hex characters.
- Priority: 0 normal / 1 important / 2 SOS.
- Maximum relays: 6.
- Maximum expiry window: 7 days.
- This checksum detects accidental corruption, not adversarial tampering or sender authenticity.
- Duplicate identity: same `id`, regardless of hop count.
- Max total encoded length: 850 ASCII characters (scanning may be slower at the upper bound).

## Security and privacy boundaries
All data is plain text in the QR. Device-local persistence only. Alias may be forged. There is no TLS between offline devices: the transfer is an optical scan. HTTPS is still required for PWA/camera features when hosted. Never advertise secure, authenticated messaging.

## Visual direction
Original 'pager from the future' visual system: ink-dark navy, phosphor green, mono telemetry, abstract radar circles, no third-party branding. Desktop 3-column command station, mobile bottom navigation, reduced-motion support.

## Deployment
Static HTML/CSS/JS only, no runtime npm dependencies. `node scripts/build.mjs` outputs `dist/`. Browser installation via service worker under HTTPS or localhost. Full functionality via manual packet transfer even where BarcodeDetector is unsupported.

## Kiro improvement opportunities (genuine use later)
- Build a camera scanner fallback via an offline JS QR decoder with robust device/browser testing.
- Add property-based tests (e.g. `fast-check`) to fuzz malformed/Unicode payloads.
- Use actual Kiro specs and hooks to add robust storage migration, accessibility improvements and integration test coverage.
- Document real Kiro prompts, resulting diffs and verified test output.
