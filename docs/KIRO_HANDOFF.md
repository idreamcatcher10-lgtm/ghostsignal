# Kiro handoff: make the project hackathon eligible

**Current status:** GhostSignal is a working hackathon prototype. The `.kiro/` directory contains planning drafts, not a record of completed Kiro implementation. To meet Kiroween requirements, complete meaningful development work in Kiro and document verified results.

## Once credits arrive

1. Open `ghostsignal/` in **Kiro IDE** (or Kiro CLI). Do not make a second unrelated repository.
2. Inspect `.kiro/specs/ghostsignal` and `.kiro/steering`. Treat these as *working specification drafts* and ask Kiro to revise them according to findings in the current implementation.
3. Ask Kiro to deliver a meaningful functional improvement, such as robust scan retry/recovery, better camera guidance and accessibility, or property-based tests for malformed protocol packets.
4. Use spec-driven development to generate/approve requirements/design/tasks for the actual new work; save the resulting artifacts.
5. Have Kiro implement and verify those tasks. Preserve relevant code diffs/commits and **actual** Kiro actions.
6. If available, create a real Kiro hook that runs tests/typecheck after appropriate file changes. Verify the hook triggered as expected. Do not invent hook use.
7. Run `npm test`, a production build and real two-phone airplane mode tests. Record genuine outputs.
8. Update `README.md`, Devpost technology explanation and your video with exactly what Kiro did, what it changed, where Kiro helped and what didn't work.

## Suggested Kiro starter prompt (paste verbatim)

> You are improving GhostSignal, a working hackathon prototype. The prepared `.kiro/` docs are planning drafts; attribute Kiro only to changes it actually implements. First inspect `README.md`, `src`, `tests`, and the prepared `.kiro/specs/ghostsignal` files. Propose one high-impact improvement to the cross-browser offline QR receiving experience, and use Kiro spec-driven development to document, implement and test it. Preserve architecture, all user-visible safety warnings and no-backend guarantees. After implementation, show what you actually changed, evidence of tests, and which Kiro features were actually used. Avoid implying unimplemented security or automatic wireless mesh capabilities.

## Exact description template for Devpost (only after completing real Kiro tasks)

> We used Kiro [IDE/CLI/etc — name actual tool] to [specific implemented improvement], supported by [specific spec/steering/hook/testing features actually exercised]. Kiro helped us [measurable verified result]. The repository includes the project specs and verified Kiro development artifacts. [Disclose genuinely pre-existing code/work if the competition rules require it.]

Do not fill placeholders with features not used in reality.
