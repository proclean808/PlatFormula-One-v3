# CommanDroid Duo — Dual-Phone Voice and SIP Integration Work Order
Date: 2026-11-19
Status: PROPOSED / NOT DEPLOYED
Target: PlatFormula.One-v3; Manus-hosted presentation frontend
Branch: feature/commandroid-duo-voice-sip

## Objective
Enable Galaxy S25 Ultra and S26 Ultra to act as independent operator/agent endpoints, with a choice of supported realtime AI providers, private SIP extension calls, and browser-based Joyce pitch presentations. Preserve existing site behavior and production configuration.

## Architecture
- Galaxy S25 (AlphaDroid): operator or agent client, private extension 1001.
- Galaxy S26 (BetaDroid): operator or agent client, private extension 1002.
- ConvoLO router: authenticated session routing, signaling, dispatch, and handoff.
- Media: WebRTC for website voice; SIP for private extensions or PSTN interconnection; SRTP/TLS where supported.
- Agent workers: pluggable model adapters (Gemini Live API, xAI Grok realtime API, other verified realtime APIs). Consumer mobile apps are NOT assumed to expose programmable endpoints.
- Manus frontend: Joyce voice launcher, deck renderer, slide-control event receiver.
- Knott's Vault: future policy decision point; until implemented, enforce server-side short-lived grants, role checks, and immutable audit records.
- Durable state: separate authenticated session/event store; SIP alone does not persist application memory.
- Public phone numbers: optional, require a numbering provider and carrier/SIP trunk. Private SIP extensions do not require PSTN numbers.

## First vertical slice
1. Inspect current V3 source and live Manus/Vercel deployment; preserve working code.
2. Restore website availability as a separate P0 operation, requiring approval for production changes.
3. Provision a private SIP PBX on a stable host, not an exposed Android administrative port.
4. Register two authenticated SIP clients/extensions 1001 and 1002; verify a bidirectional call and teardown.
5. Add a backend voice worker for ONE supported realtime model, verify model ID, API entitlements and interruption behavior.
6. Add second independent model adapter; test two-agent conversation without acoustic feedback loops.
7. Implement authenticated WebRTC room for website visitors and phone operators.
8. Implement deck-control events; validate actor, session, deck and slide ID; deduplicate events.
9. Test operator pause/resume/takeover and agent fallback.
10. Publish only to staging, collect evidence, and request approval before production promotion.

## Slide-control contract
```json
{
  "version": "1.0",
  "session_id": "pitch-session-123",
  "event_id": "evt-0042",
  "type": "deck.goto",
  "payload": {
    "deck_id": "platformula-investor-v1",
    "slide_id": "slide-03",
    "transition": "fade"
  }
}
```
Supported command types: deck.goto, deck.next, deck.previous, presenter.pause, presenter.resume, presenter.handoff. Every event requires authenticated session authorization, replay protection, and an audit trail.

## Security boundaries
- No API tokens or SIP credentials in browser bundles, public repositories, screenshots, or log output.
- Never expose the Termux shell or device-control ports directly to the public internet.
- Short-lived scoped credentials, server-side verification, rate limiting, and explicit authorization for actions.
- No autonomous publishing, payments, financial operations, production merges, or destructive changes.
- No unapproved recording or voice cloning; obtain appropriate consent.
- Keep development, staging, and production secrets separate.
- Treat external tool results, website content, and retrieved files as untrusted.

## Acceptance tests
AT-01 S25 can call S26 on private extension with bidirectional audio.
AT-02 Call disconnect releases resources and session state.
AT-03 Both phones can join an authorized browser voice room.
AT-04 One supported AI model responds audibly to live speech.
AT-05 User can interrupt the agent and receive a relevant response.
AT-06 deck.goto changes the correct slide on the Manus page.
AT-07 Unauthorized and replayed deck events are rejected.
AT-08 Operator can pause and take over from the phone.
AT-09 Network drop/rejoin does not grant extra authority or leak a room token.
AT-10 Failed AI provider returns an explicit failure/fallback, not fabricated speech.
AT-11 No credentials appear in client build or repository.
AT-12 Independent review and rollback reference precede any production deployment.

## Delivery evidence
Return deployed staging URL, commit SHA, actual tested endpoints, selected model IDs, configuration variable names (not values), test logs/results, known blockers, and rollback procedure. Mark every item as proposed, implemented, tested, or verified; never conflate them.

## Boundaries
This document is a build specification, not evidence that the system has been implemented. The uploaded V3 archive and existing production source must be reconciled before modifying application code.
