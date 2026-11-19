# PlatFormula.One — AlphaBots Team / A-Team Integration Handoff
**Version:** 2026-11-19 · **Status:** architecture assembled; live multi-agent conference NOT verified
**Audience:** ChatGPT, Grok, Gemini, Claude Code, Manus, MagicPath, and the founder
**Mission:** Demonstrate one founder-led, Joyce-produced, multi-agent, interruptible, interactive show, then reuse its core in investor rooms, recruiting, sales, education, and storefronts.

## 0. Fixed product vocabulary
- **AlphaBots Team (A-Team):** the founder's original name; persistent live AI-native council.
- **Joyce / ConvoLO:** incoming-call receptionist, producer, screener, moderator, and handoff coordinator; NOT the whole product.
- **Botcast Arena:** public/private live broadcast surface for the council and guests.
- **Live AI Council Kit:** reusable room, presence, turn-taking, data, and authorization API; can use LiveKit, PBX, or other transport.
- **Inreach:** permissioned availability beacon and opt-in introductions; the interested party initiates contact in response to a genuine offering.
- **Special Teams / Special Sales:** deployable workflows built on AlphaBots, not a competing platform.
- **Central Sentry / K-Link:** separate policy authorization and device-execution gateways; never confuse conversation with permission.

## 1. Inventory first — what exists versus what is unverified
| Asset | Existing knowledge | Operational status / decision |
|---|---|---|
| Grok Voice Agent Builder | Founder reports ~8 configured telephone agents and phone numbers; xAI documents assigned numbers and SIP | **User-reported; account inventory, billing, incoming-call acceptance unverified**. First test resource |
| Mint Mobile lines | Founder has live cellular numbers | Keep carrier assignments unchanged; optional manual forwarding after tests |
| Google Voice | Two existing numbers reported | Optional caller / test endpoint. Not a realtime AI model gateway by itself |
| Vapi | Two existing numbers and samples reported | Park; no new spend or code in critical path |
| Twilio / Joyce | Existing Joyce telephone route and backend | Do not reroute or assume agent is ready; credentials/live-call readiness not verified |
| LiveKit | Intended voice room + participant data | No verified running project or agent worker; production room candidate |
| AgentCouch | Existing PlatFormula.One private room | Room exists, but at last inspection had one member and zero messages; needs peer agents |
| Agent Relay | Connector available | At last roster check, no discoverable live agents; connect running participants before using |
| Telegram | Bot-to-bot messages supported, incl. group chat | Messaging/alerts first; live group voice needs separate supported bridge |
| Discord | Text and voice bot ecosystems | Candidate human/agent production room; actual bot voice gateway needs integration |
| 3CX PBX | Public Grok / Gemini realtime sample code and call control | First proven reference for SIP / call mixing; provisioning/license requirements must be verified |
| Asterisk / FreePBX | Open PBX alternatives | Secondary option if no existing conference bridge is suitable |
| AgentPhone | MCP + telephone numbers | Optional alternative; no purchase for this MVP |
| Hermes / Gemini / Pipecat | Existing voice wrapper / agent framework candidates | Donors only; avoid replacing the working telephone agent |
| Android S25 Ultra + S26 Ultra | Termux, Shizuku, automation and remote control tools | Separate execution nodes; no direct phone command until authenticated / tested |
| Droidline / MobileClaw / AgentPaw / DroidClaw / Phone Harness | Device control/test candidates | Evaluate one sandboxed read-only path; none is a confirmed substitute for a live voice conference |
| MagicPath / Manus / Make / Vercel / GitHub | UI design, backend, workflows, hosting, source control | Existing project infrastructure; verify target credentials and deployments rather than guessing |
| LinkedIn / Sales Navigator | Lead discovery and professional networking | Use supported product or authorized APIs and human-reviewed outreach; do not automate prohibited scraping/messaging |
| Moltbook / X / WhatsApp / Google Chat | Optional discovery, distribution and messaging surfaces | External interface adapters, NOT trusted governance or media transport |

## 2. Build-versus-buy decision: no new telephone framework
**Fastest phone proof (M0):** Call two EXISTING Grok voice-agent numbers independently; log their greetings and call IDs. If both can receive calls, connect them via an existing telephone conference bridge that can dial out to both. Confirm the actual conference provider supports outbound legs and mixing; two dialable numbers do NOT themselves form a conference.
**PBX reference (M1):** Reuse the official 3CX Agentic Call Control examples with xAI and Gemini realtime voice. This is a reference implementation, not proof a 3CX license or deployment exists.
**Production room (M2):** One LiveKit room. Main host, Joyce, invited council workers, investor/viewer and guests are distinct authenticated participants; native realtime speech-to-speech only (no added STT/TTS chain). Telephone guests arrive via an authorized SIP/telephony gateway.
**Messaging plane (M3):** AgentCouch for private asynchronous coordination, Agent Relay for direct agents, Telegram / Discord as optional interface adapters. Do not pretend a Telegram Bot API group chat is a SIP conference.

## 3. Functional architecture
INREACH REQUEST / PHONE CALL / INVESTOR LINK / JOB CANDIDATE
  -> authenticated invitation and consent
  -> JOYCE screening (human vs AI representative disclosed)
  -> LOBBY/QUEUE with availability beacon
  -> HOST admits participant / chooses scene
  -> ALPHABOTS live room (human host + Joyce + specialist council + guests)
  -> broadcast AV and synchronized media/data controls
  -> CENTRAL SENTRY authorization when a tool or outbound communication is requested
  -> K-LINK or service adapter (only after explicit grant)
  -> evidence ledger (Observed / Authorized / Executed / Verified separate)

**Explicit roles:** founder/host, producer/Joyce, council_anchor, external_guest, investor_viewer, moderator, observer. A guest has no control-plane privileges by default.
**Audio discipline:** only the current speaker has the floor; producer may interrupt, mute, move to lobby, or redirect; prevent agent-to-agent infinite reply loops with explicit turn budget and max duration.
**Presence:** the real identity, consent, provider, participant ID, active/inactive, human/AI disclosure, capabilities and scopes are recorded. No unverified celebrity impersonation.

## 4. Adapter contract / source of truth
- **Telephony adapter:** numberId, provider, agentId, callId, direction, legState, conferenceId, lastSeenAt. Never put telephone credentials or personal phone numbers in the public repo.
- **Media adapter:** roomId, participantId, tracks, voice provider, mute state, activeSpeaker, transport, reconnect state.
- **Coordination adapter:** messageId, room/channel, sender agent identity, recipient, priority, attachments, authorization state.
- **Pitch/broadcast adapter:** deckId, slideIndex, mediaPositionMs, playbackState (playing/paused/seeking), sceneId, cueId, revision.
- **CRM/Inreach adapter:** optInId, offerId, permittedContactMethods, verifiedInterest, sourceAttribution, availabilityWindow, consentAt, expiryAt, status.
- **Evidence:** eventId, timestamp, source, observed data, action/grant, outcome, independent verification reference. Keep sensitive PII out of public logs.

Use an event envelope such as:
    { "v":1, "eventId":"uuid", "roomId":"room", "type":"pitch.slide.changed", "senderId":"participant", "sequence":1, "timestamp":"ISO8601", "payload":{"deckId":"deck","slideIndex":2} }
Core events: room.participant.joined, room.participant.left, voice.floor.requested, voice.floor.granted, voice.floor.released, call.queued, call.admitted, pitch.slide.changed, pitch.playback.changed, pitch.deck.command, pitch.deck.command.result, inreach.requested, inreach.accepted, tool.authorization.requested, tool.authorization.granted, execution.verified.
**Security:** authenticated senders; per-role permissions; sequence/deduplication; no autoexecuting arbitrary data channel messages or public forum text.

## 5. Use-case A — Botcast Arena / investor room
1. Founder starts a production room, Joyce greets entrants and introduces council anchors.
2. Investor can speak, raise hand, ask a question, request an evidence-backed demonstration, or request scene replay.
3. Joyce pauses the interactive film; a relevant specialist answers once, then yields.
4. Founder retains show direction. Joyce handles call queue, avatars/camera cuts, media state, and evidence retrieval.
5. Save signed/traceable session and action receipts with consent. No unsupported financial claims.

## 6. Use-case B — Inreach and founder-team matching
**Offer-driven inbound:** Publish a real opportunity, accurate scope, location/hybrid attendance expectations, compensation/equity range where known, who is responding (human or agent), and an opt-in beacon.
**Qualification:** User voluntarily specifies professional background, interest, availability, preferred channel; minimal necessary data, time-bound consent, review and deletion.
**Recruiting example:** Verified fractional CTO opening in San Francisco hybrid. Screen for required skills and attendance availability and assess work authorization where legally appropriate; do not make decisions from protected characteristics or ethnicity.
**Matching:** Manually reviewed Sales Navigator leads and approved LinkedIn workflows; prioritize quality, expertise, referrals and reciprocal value. AI drafts tailored messages for founder approval, never fabricates job listings, false demand, false referrals, or sends unauthorized bulk DMs.
**Council handoff:** Joyce schedules a conversation with AlphaBots Tech/Finance/Growth experts after the interested person opts in.
**Product KPI:** genuine opted-in requests, qualified conversations, show attendance, verified meetings, conversion, unsubscribes / complaints; never maximize spam volume.

## 7. Existing tools and exact responsibility
| Tool | Keep it for |
|---|---|
| Grok Builder | Existing telephone AI identities with native speech-to-speech |
| 3CX / PBX / SIP | Telephone call legs, conferencing, extension routing, mixing |
| LiveKit | Low-latency shared WebRTC room, agent participants, data packets |
| Joyce | On-air producer, screening, cues, call admissions |
| AgentCouch | Private agent-to-agent text/evidence handoffs |
| Agent Relay | Directed agent messaging and owned agent session context |
| Telegram | Bot group messages, approvals, mobile alerts |
| Discord | Community sessions, voice experiments with proper bot gateways |
| Obsidian / Hermes / memory | Long-term project knowledge and grounded continuity |
| Central Sentry | Approval, scoped grants, audit |
| K-Link | Authorized device / service execution |
| GitHub | Versioned source, issue tracking, proof artifacts |
| Manus | Worker/backend implementation and environment setup |
| MagicPath | Multi-host show controls and responsive interface prototype |
| Make | Asynchronous after-call receipts, follow-up workflows; not the realtime audio path |
| Vercel | Public user interface / preview / deployment |

## 8. Prioritized tests (do not skip gates)
- **T0 Existing asset inspection:** xAI account shows each configured agent, number, status and billing eligibility. Screenshot or API-backed metadata with secrets redacted.
- **T1 Live single call:** One independently placed call reaches one Grok agent; prove actual voice response and call record.
- **T2 Two-agent conference:** Two separate agent phone calls connected in existing bridge; hear bidirectional audio, capture conference logs; turn-taking doesn't loop.
- **T3 Human + Joyce + guest:** Two humans/phones + one AI producer share room, can mute, hold, admit, disconnect and rejoin.
- **T4 Presentation state:** Investor pause/interrupt -> playback pauses, specialist answers -> resumes accurate scene, with data packet ack.
- **T5 Inreach:** Genuine availability beacon -> consented inquiry -> Joyce qualification -> scheduled live room; no fake job post.
- **T6 Execution:** One low-risk read-only S25/S26 action, scoped approval, independent evidence receipt.
- **T7 Embed:** Same room technology appears in Botcast Arena, an investor presentation, and a PlatFormula webpage.
Each gate must be tagged PLANNED, BLOCKED, EXECUTED, or VERIFIED with a timestamp and concrete evidence. Never represent a demo script, a passing unit test, or a provisioned number as a live end-to-end pass.

## 9. Action allocation for the council
- **Founder:** chooses two existing Grok agent numbers for private T1/T2 and approves any spend/routing change.
- **Joyce / Grok voice provider:** verify account-side provisioned agents, call capabilities, and test call records.
- **Claude Code:** integrate the chosen existing 3CX/PBX and LiveKit samples; no fresh protocol.
- **Gemini:** assess Gemini Live realtime compatibility and A/V interruptions.
- **ChatGPT:** track GitHub code, acceptance evidence, guardrails and integration gaps.
- **Manus:** deploy isolated server-side worker after credential and provider auth are available.
- **MagicPath:** build the live host dashboard only after event schema is fixed.
- **Central Sentry:** enforce signed grants and disclosure on all externally consequential actions.

## 10. Hard rules
1. Reuse paid/provisioned services before buying or building duplicates.
2. Keep phone numbers, secrets, account identifiers and investor/contact personal data out of public GitHub.
3. Distinguish consumer Grok Voice app, Grok Voice Builder agents, and xAI realtime API credentials.
4. Do not forward or transfer live phone numbers, purchase subscriptions, contact prospects, place paid calls, or automate outbound messages without authorization.
5. No unlabeled synthetic identities, fabricated recruiting demand, automated spam, protected-class screening, or unauthorized LinkedIn automation.
6. Human host can override all automated speaking and media controls.
7. Evidence over promises. First deliver T1/T2, not a complete re-platform.

## 11. Research / donor links
- xAI Builder: https://x.ai/voice
- xAI SIP: https://docs.x.ai/developers/model-capabilities/audio/speech-to-speech/sip
- 3CX open-source examples: https://github.com/3cx/agentic-call-control
- LiveKit dispatch: https://docs.livekit.io/agents/server/agent-dispatch/
- LiveKit realtime rooms: https://docs.livekit.io/frontends/build/media-data/
- Telegram bot-to-bot: https://core.telegram.org/api/bots/bot-to-bot
- AgentPhone optional MCP: https://docs.agentphone.ai/mcp
- Pipecat donor: https://github.com/pipecat-ai/pipecat
- LinkedIn Sales Navigator automation restrictions: https://www.linkedin.com/help/sales-navigator/answer/a1341387

**Current delivery status:** This document is a reproducible, council-ready handoff. Creating it does not imply that any external audio worker, SIP trunk, PBX room, or live agent-to-agent call has been activated.
