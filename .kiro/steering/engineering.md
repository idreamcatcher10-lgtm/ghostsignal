# GhostSignal engineering steering

- TypeScript strict mode; do not add browser-time npm/CDN dependencies unless justified.
- Protocol changes require a version bump and migration/compatibility plan.
- Keep message serialization pure and separately testable.
- All rendered untrusted messages must escape HTML or use textContent.
- Preserve meaningful validation, duplicate detection and hop limits.
- Offline means caching the entire app shell after first load; test real airplane-mode behavior.
- Use browser-native features when stable; always provide a documented fallback for experimental APIs.
- `dist/` is deployment output. `.kiro/` must remain in Git (not ignored).
- Test before publishing; document device/browser test results with dates.
