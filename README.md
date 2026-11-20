> **Repository import in progress:** The complete GhostSignal MVP source is available in the chat's `GhostSignal-MVP-source.zip` artifact; it has not yet been uploaded to this GitHub repository. The existing technical documentation describes that local build and should not be mistaken for a complete online checkout.

# GhostSignal 👻📟

**Messages find a way.** GhostSignal is an offline-first, human-relayed QR pager — an homage to the 1990s pager, rebuilt as an installable browser app. Create a short message, show its QR to someone nearby, and let the recipient store it and show it to the next person. No backend, account, paid API, Internet connection (after the initial load), or Kiro credits are required to run this MVP.

> **Prototype safety notice:** GhostSignal is not an emergency-response system. It offers no encryption, sender authentication, background radio transmission, or guaranteed delivery. A CRC32 checksum detects accidental corruption only; it provides **no security** against malicious edits. Do not include sensitive data or substitute it for emergency services.

## 🚀 Run the app

Prerequisite: **Node.js 22+**. The archive includes prebuilt `dist/` assets, so it works without running `npm install`.

```bash
node scripts/serve.mjs
```

Open **http://127.0.0.1:4173**. On first use, keep connectivity available long enough for the PWA assets to cache; subsequent reloads should work offline in supporting browsers on HTTPS or localhost.

To edit, compile and test the TypeScript source:

```bash
npm install              # only for editing/rebuilding
npm run dev              # build + local server
npm test                 # build + protocol tests
```

`npm run build` creates a static hosting-ready `dist/` directory. The compile process needs TypeScript (`npm install`) if not already installed; the app itself has **no runtime npm dependencies**.

### Deploy

Upload the **contents of `dist/`** to Cloudflare Pages, Vercel static hosting, Netlify, or other HTTPS static hosting. Configure the website's root directory appropriately. No server-side code or API keys are required. HTTPS is needed for service workers and camera permission away from localhost.

GitHub must be created by the submitter; this archive intentionally does **not** claim a repository URL or a live deployment that does not exist.

## 📱 Demo on two devices

1. While online, open/install the live HTTPS site on **both** phones, then reload once to ensure the offline cache is active.
2. Turn on airplane mode on both phones; optionally keep the local Wi-Fi link disabled too.
3. On Phone A, go to **Compose**, click **Fill demo message**, then **Generate signal**.
4. Phone A displays a real QR with a `GS1` packet encoded in it.
5. On Phone B, go to **Receive / Scan** and scan the QR using a browser with native `BarcodeDetector` support. If not supported, use the phone camera's QR reader to obtain and copy the QR's text, then paste the `GS1...` string into **Import a packet manually**. QR image import also requires native BarcodeDetector.
6. Message appears in Phone B's **Inbox**. Open it and tap **Relay as QR**. Relay count increases, while the message ID remains unchanged.
7. A third phone can repeat the relay. Re-importing a packet with the same ID will be rejected as a duplicate. Relaying stops after six hops or when expired.

**Known limitation:** Native in-app QR camera/image scanning relies on the experimental [Barcode Detection API](https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API) and is not supported by all browsers. The manual `GS1` import fallback is always available. Offline operation on particular physical devices has **not yet been certified** by this package's automated tests.

## ✨ Implemented

- Original retro-futuristic responsive interface with separate Compose / Inbox / Receive / Guide views
- SOS, Important, Normal priorities
- Versioned `GS1` QR packet protocol with Unicode/UTF-8 support
- QR generation without a CDN or cloud API
- QR camera and image import **only where native BarcodeDetector is supported**
- Manual QR packet copy/import fallback for all browsers
- Device-local IndexedDB message archive; localStorage fallback
- Browser-based PWA manifest and offline service-worker caching
- Persistent sender label, search and priority filtering
- Packet ID deduplication, validation, maximum 6 relays, expiry (24h / 72h / 7d)
- Helpful errors, QR PNG export and protocol unit tests
- No analytics or telemetry sent to servers

## 🧩 How it works

```text
Phone A                                      Phone B
──────────                                   ───────────
Type message                                 Open Receive
  ↓                                             ↑
GS1 packet → [QR displayed] -- optical scan --> Decode/validate
  ↓                                             ↓
Local archive                               Local archive
                                                ↓
                                       New QR with hops +1
                                                ↓
                                         Scan on Phone C
```

`GS1.<base64url UTF-8 JSON tuple>.<CRC32>` — currently a v1 packet that stores an ID, creation and expiry timestamps, priority, display alias, body, hop count and max hops. Packet size capped at 850 ASCII characters for scannability. CRC32 **is not** a cryptographic signature. The relay is entirely human-assisted.

## 🧪 Tests

Run `npm test`. Unit coverage includes roundtrip serialization with Vietnamese Unicode, CRC32, tampering, expiry, limits, invalid input and QR payload format. The actual QR pixel matrix was separately rendered and independently decoded with OpenCV QRCodeDetector during project QA. See `docs/QA_REPORT.md`.

## 🛠 Stack

| Layer | Technology |
|---|---|
| App | TypeScript, vanilla Web APIs, semantic HTML, CSS |
| Data | IndexedDB with localStorage fallback |
| PWA | Service Worker + Web App Manifest |
| QR generation | Vendored `QRCode for JavaScript` via `qrcode-terminal` (local, MIT/Apache-2.0) |
| QR scanning | Browser `BarcodeDetector` where available + text import fallback |
| Build | TypeScript (`tsc`) and small Node.js build script |
| Tests | Node.js built-in test runner |

**Why no React?** Dependency-free runtime greatly simplifies resilient offline operation. This is a conscious departure from the initial React concept; React is not claimed in the Devpost technology list.

## 👻 Kiroween 2026 status — read before submitting

Category: **Resurrection** (reimagines the classic pager). The repo includes **prepared** `.kiro/specs/` and `.kiro/steering/` documents to make later Kiro work straightforward. They were drafted **outside Kiro**, so they **do not demonstrate that Kiro was used**. This project has **NOT** yet met the required Kiro-use portion of Kiroween 2026.

Before submitting, the entrant must genuinely use Kiro to review/implement meaningful improvements and tests, preserve actual Kiro-generated specs/changes/hooks as appropriate, accurately disclose its use, create a public GitHub repository, deploy the app, perform real device tests, and record an actual YouTube demo under three minutes. Details: `docs/KIRO_HANDOFF.md` and `docs/DEVPOST_CHECKLIST.md`.

## 📂 Layout

```text
├── .kiro/
│   ├── specs/ghostsignal/   # Prepared handoff spec; not yet executed by Kiro
│   └── steering/            # Prepared project guidance
├── src/                    # TypeScript, CSS
├── assets/                 # Local app icons
├── vendor/qr/              # Locally copied QR generator + notices
├── tests/                  # Protocol tests
├── scripts/                # Build and preview server
├── dist/                   # Precompiled static site (deployment-ready)
└── docs/                   # Technical notes, testing, submission plan
```

## License

Application: [MIT](LICENSE). Vendored QR encoder: see `vendor/README.md`, individual source file headers, and `vendor/THIRD_PARTY_LICENSE_APACHE_2.txt`. All custom GhostSignal visuals are original CSS/SVG designs. No third-party logos are incorporated.