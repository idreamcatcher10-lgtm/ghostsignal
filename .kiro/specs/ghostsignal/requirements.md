# GhostSignal requirements — draft prepared before Kiro use

**Status:** Prepared externally, pending genuine review/implementation inside Kiro. This document is not evidence that Kiro has already been used.

## User stories and acceptance criteria

### US-1: Create a pager message
As a user, I want to write a short message without signing in so I can prepare it for offline relay.
- A1: 1–160 visible Unicode code points of body content; 1–24 visible alias characters.
- A2: Priorities normal / important / SOS and expiry 24 / 72 / 168 hours.
- A3: Cannot create empty, expired or oversized wire payloads.
- A4: Store the created message locally with a random 72-bit identifier.

### US-2: Generate a QR without cloud services
As a sender, I want the QR to be created entirely locally and to be readable by normal QR scanners.
- A1: Encoded versioned GS1 packet, ASCII compatible, max 850 characters.
- A2: QR has quiet zone, sufficient contrast and export as PNG.
- A3: Unicode text remains byte-for-byte equivalent after decode.
- A4: The app does not require a remote API/CDN to create QR.

### US-3: Receive a packet
As a recipient, I want to scan or paste a GS1 packet and save it on my device.
- A1: Validate version, checksum, timestamps, priority, expiry, maximum hops, payload type/size.
- A2: Prevent duplicate IDs even if they have a different hop count.
- A3: Camera/image import only where native BarcodeDetector is present; otherwise guide user to manual import.
- A4: No need for a network request to import a message.

### US-4: Relay a message
As an intermediary, I want to make a new QR for an already received message.
- A1: Relay preserves ID, body and timestamp; increments hop count by one.
- A2: Cannot relay expired messages or messages at 6 hops.
- A3: A relayed packet remains parseable by any other GhostSignal instance.

### US-5: Local-first and offline
As a user, I want my messages to be available after reload and offline.
- A1: Inbox persists in IndexedDB, with localStorage fallback.
- A2: PWA installation precaches code, styles, icons and core HTML.
- A3: The app never silently claims a camera was tested when native support is absent.
- A4: Users are warned not to include secrets; this is not a certified emergency system.

### US-6: Mobile UX
As a user of a small phone, I want to reach compose, inbox and receive without horizontal overflow.
- A1: 320px–1920px responsive layout.
- A2: Keyboard accessible semantic inputs, dialog and visible focus.
- A3: State changes and errors have visible announcements.

## Out of scope
Automatic mesh networking; Wi-Fi/Bluetooth transport; sender authentication; end-to-end encryption; backend; GPS; real emergency delivery guarantee.

## Next work for Kiro
Review these externally drafted criteria, propose relevant improvements, implement and test them using Kiro specs/tasks, and record the actual Kiro steps, decisions, hooks and generated artifacts. Never describe this prepared draft as Kiro-authored.
