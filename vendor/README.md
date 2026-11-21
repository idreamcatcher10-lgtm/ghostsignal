# Vendored QR generation (offline)

The `qr/` directory preserves the MIT-licensed QRCode for JavaScript by
Kazuhiko Arase, as distributed under `qrcode-terminal` 0.12.0 (Apache 2.0).
Original software: https://github.com/gtanner/qrcode-terminal .

Files are not modified. A local build script wraps these CommonJS modules
into a browser-friendly IIFE (`dist/assets/qr-vendor.js`) so GhostSignal
works without loading a CDN or needing a Node/npm server.

See `THIRD_PARTY_LICENSE_APACHE_2.txt` and source-file headers. No external
API or service is used for QR generation.


## QR decoding dependency

The `jsqr` package (version 1.4.0, Cosmo Wolfe, Apache-2.0) is pinned
in `package.json` and copied into `dist/assets/jsqr.js` at build time.
Upstream: https://github.com/cozmo/jsQR.
This makes QR decoding offline-capable on browsers lacking native
BarcodeDetector, without requesting resources from a CDN.
The Apache 2.0 license text is also copied to the deployed assets.
