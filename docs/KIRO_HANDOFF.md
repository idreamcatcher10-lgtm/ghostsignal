# Kiro handoff: make the project hackathon eligible

**Current situation:** The code in this archive was drafted and implemented externally, **not in Kiro**. Simply adding `.kiro` files does NOT satisfy the Kiroween requirement to actually use Kiro. Never describe the prepared specs as Kiro-generated work.

## Once credits arrive

1. Open `ghostsignal/` in **Kiro IDE** (or Kiro CLI). Do not make a second unrelated repository.
2. Inspect `.kiro/specs/ghostsignal` and `.kiro/steering`. Tell Kiro explicitly these are *drafts authored before Kiro use*, and ask it to revise them according to findings in the current implementation.
3. Ask Kiro to deliver a meaningful functional improvement, such as a cross-browser fully offline QR decoder, an improved scanner state machine, or property-based tests for malformed protocol packets.
4. Use spec-driven development to generate/approve requirements/design/tasks for the actual new work; save the resulting artifacts.
5. Have Kiro implement and verify those tasks. Preserve relevant code diffs/commits and **actual** Kiro actions.
6. If available, create a real Kiro hook that runs tests/typecheck after appropriate file changes. Verify the hook triggered as expected. Do not invent hook use.
7. Run `npm test`, a production build and real two-phone airplane mode tests. Record genuine outputs.
8. Update `README.md`, Devpost technology explanation and your video with exactly what Kiro did, what it changed, where Kiro helped and what didn't work.

## Suggested Kiro starter prompt (paste verbatim)

> You are taking over GhostSignal, an existing **newly built hackathon prototype created outside Kiro**. Do not claim any prior work was Kiro-authored. First inspect `README.md`, `src`, `tests`, and the prepared `.kiro/specs/ghostsignal` files. Propose one high-impact improvement to the cross-browser offline QR receiving experience, and use Kiro spec-driven development to document, implement and test it. Preserve architecture, all user-visible safety warnings and no-backend guarantees. After implementation, show what you actually changed, evidence of tests, and which Kiro features were actually used. Avoid implying unimplemented security or automatic wireless mesh capabilities.

## Exact description template for Devpost (only after completing real Kiro tasks)

> GhostSignal was initially prototyped outside Kiro. We then used Kiro [IDE/CLI/etc — name actual tool] to [specific improvement], supported by [specific spec/steering/hook/testing features actually exercised]. Kiro helped us [measurable verified result]. The repository includes the project specs and actual Kiro artifacts. [Disclose any pre-existing or externally created work as required.]

Do not fill placeholders with features not used in reality.