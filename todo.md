# PlatFormula.One Restoration Checklist

- [x] Confirm the existing forwarded PlatFormula.ONE address can point to the managed project.
- [x] Restore the verified F1/rainbow founder-dashboard baseline from the supplied repository archive.
- [x] Preserve and validate the colorful homepage tiles, Next YC Deadline card, and responsive rainbow navigation.
- [x] Restore the secure Free Tier waiting-list implementation with consent, name, email, phone, and idempotent enrollment.
- [x] Restore Pro and Studio Coming Soon dialogs that route visitors to the Free Tier waiting list.
- [x] Confirm the `users` and `waitlistEntries` database tables exist.
- [x] Validate TypeScript, automated auth/wait-list tests, and a production build.
- [x] Verify the Free Tier, Pro, and Studio dialog states in the full-stack preview.
- [x] Verify `platformula-one.manus.space` returns the restored F1 dashboard.
- [x] Record the external-domain result: `platformula.one` currently serves a minimal landing page with a link to the managed domain; no IONOS redirect/frame configuration was changed in this restoration.
- [x] Save the restored full-stack release checkpoint (`a79ce3db`).
- [x] Preserve a local rollback archive before source replacement.
- [x] Keep the previously delivered ZIP release export available for manual repository upload.
- [x] Record the GitHub synchronization disposition: deferred because no authenticated write access was available and the user chose manual ZIP upload.

## Deferred user-controlled verification

A real end-to-end Free Tier submission and repeat-update check requires the user's own Manus/Google authentication and contact information plus explicit consent. No personal data was fabricated or submitted. The automated suite covers consent validation and idempotent create/update behavior.

## November 12, 2026 load-failure repair

- [x] Reproduce the custom-domain failure independently on mobile: cross-origin frame denies localStorage and useAuth crashes during rendering.
- [x] Add guarded storage helpers; move optional auth metadata persistence out of rendering into a safe effect.
- [x] Guard theme and dashboard preference storage; keep existing visual design and database unchanged.
- [x] Run TypeScript, production build, and all 14 tests, including seven storage-resilience regression tests.
- [x] Verify mobile preview rendering and Resource navigation with storage allowed, blocked, and blocked within a cross-origin frame.
- [x] Publish the repaired checkpoint through WebDev's Publish control, then verify the actual platformula.one frame no longer crashes. User published release 46737118; public bundle index-B_-pi2Lr.js confirmed November 12 at 20:10 UTC. Both real mobile domains render and Resource navigation passes; public auth API returns HTTP 200.

Public requests and direct mobile rendering succeeded during the investigation; no evidence established a sleeping backend as the cause of this reproduced failure. Third-party analytics can still emit a storage-denied error, but app rendering and navigation survive it. IONOS framing remains unchanged, including its missing mobile viewport metadata; HTTP forwarding is a separate improvement requiring domain-provider access.

## November 17, 2026 investor-facing founder story and bounded assistant

- [x] Inspect StartOpX, Atoms, Pitch and Techstars primary pages; write original copy, not copied claims/statistics.
- [x] Use exact PlatFormula.One brand capitalization and AI-Native terminology.
- [x] Expose Validate, Build, Grow and Raise plus full-name workspace destinations on desktop and mobile.
- [x] Use an opaque, readable green-accented navigation surface and preserve the F1 identity / Next YC Deadline resource.
- [x] Capture homepage intent into an in-memory founder brief with manual Markdown handoffs.
- [x] Add a local growth experiment/evidence workspace with no invented analytics.
- [x] Remove simulated assistant execution traces and replace them with authenticated, explicit-consent cloud chat.
- [x] Offer approved model IDs only when present in the live project catalog; bound inputs, per-process quotas and generation budget.
- [x] Export transcript/brief locally without requiring sign-in or cloud consent; keep remote-agent/device/vault status honest.
- [x] Remove pricing promises of live voice, unlimited AI, avatars and other unimplemented paid features; keep paid plans Coming Soon and payments disabled.
- [x] Relabel the generic OAuth handoff as secure sign-in rather than claim a custom direct Google provider.
- [x] Preserve previous browser-storage crash protections; no schema or contact-record changes.
- [x] Code-split heavy workspace modules so the homepage does not load the chat renderer immediately.
- [x] Run all 41 Vitest tests, TypeScript and production build successfully.
- [x] Verify 390px mobile and 1440px desktop navigation, handoff downloads, consent gates and waitlist / paid-tier dialogs with no page errors or horizontal overflow.
- [x] Receive a real gpt-6-luna response to one synthetic server-side smoke request; no founder data used or database records created.
- [x] Preserve new donor radar as founder-supplied diligence input, not independently verified claims or installed integrations.
- [ ] Publish this new checkpoint using the managed project's Publish control, then verify the production domain.
- [ ] Complete an authenticated browser chat and real user-consented waitlist submission; no user login fabricated.
- [ ] Complete Claude Code / Hermes / Relay / Phone Harness setup and tests on authorized actual devices.
- [ ] Complete the expanded company/affiliate primary-source audit; rejected unstarted workflows performed no reviews.

The protected Vercel command hub was not accessible without sign-in; its wording was not represented as read. Local founder briefs and chat memory are session-only, not durable vault synchronization. Cloud model calls consume project credits and do not execute external actions. API request quotas are per server process, not a distributed billing or entitlement system.

## November 18, 2026 — EverythingStartups reading remix

- [x] Inspect EverythingStartups Startup Reads category in the browser and extract article destinations.
- [x] Independently review eight practical guides and write original summaries, titles and founder exercises with attribution.
- [x] Add the founder reading room to the currently mounted Startup Resources tab, preserving directory entries and existing media.
- [x] Add shared search, All/Validate/Build/Grow/Raise reading filters, descriptive empty state and real workspace-navigation actions.
- [x] Replace the unsupported aggregate toolkit-value badge with the actual directory entry count.
- [x] Run TypeScript, all 47 tests and the production build successfully.
- [x] Verify 390px mobile and 1440px desktop filters, search, empty state, source links and Use in Build action with no horizontal overflow or page errors.
- [x] Verify eight canonical article destinations return HTTP 200.

Founder-remixed pictures remain pending; none received or copied from the publisher. This update does not complete the older 43-company affiliate audit, provision LiveKit, or change Vercel/production. The newly requested platformula-one-live repository is not anonymously accessible and no authenticated checkout was available at discovery; its native-agent implementation remains blocked on account/repository access. Native-model documentation review separately confirmed the requested GPT-Live and Gemini Live candidates, but no session was deployed or tested.

## November 18 — bottom Everything Startups link

- [x] Add a visible Everything Startups — Startup Reads link after the entire Startup Resources directory, pointing to the exact supplied category URL with safe new-tab behavior.
- [x] Add two footer attribution regression tests; all 49 tests and TypeScript pass.
- [x] Verify the link is visible and usable at 390px width with no horizontal overflow.

Both new attached images were received. Per the founder's instruction, neither image was reopened through file tools; this specific change is link-only and does not replace the current layout or incorporate the images' unverified monetary offer claims.

## November 18 — Version 3 consolidated directory release

- [x] Consolidate navigation to Home, Venture Studio, Startup Resources and Evidence; put nine primary workspaces inside Venture Studio and preserve additional existing workspaces.
- [x] Consolidate all 88 original resource entries, eight reviewed reading guides and three existing AI build tools into one 99-entry directory.
- [x] Add keyword/intent matching, explicit AI focus, category filtering, nine-card initial results, nine-at-a-time expansion, details, safe source actions and actionable empty/reset state.
- [x] Add homepage founder greeting, website/mobile/pitch/full-venture choices, local brief handoff and matching-resource navigation without simulating LLM or native-audio execution.
- [x] Verify YC query and AI directory links, use Product Hunt AI topic, and disclose unverified Techstars/Kickstarter search transfer. No provider feeds or phone agents are claimed connected.
- [x] Pass TypeScript, all 110 automated tests and the production build.
- [x] Pass real phone (390px), tablet (820px), desktop (1440px) interaction checks: navigation, local mobile-brief handoff, 9-to-18 results, search, YC query transfer, details, empty reset, eight reading guides and no horizontal overflow.

Latest request is a ZIP export for a new PlatFormula-One-v3 repository. GitHub access has not been established in this session and no repository has been created or pushed. V2 is untouched. Native conversational integration and the older broad affiliate audit remain separate, unfinished scope. Public promotion is not claimed by the source export.

## November 18 — exact four requested refinements

- [x] Dynamic goal/intent greeting with immediate honest local guidance and optional real protected, consent-gated AI personalization; no automatic mic access, upload or generation.
- [x] Interactive pitch generator preview connected to real slide state: edit, previous/next, play/pause, three styles, founder-brief input, structured AI draft, explicitly local scaffold, review/discard and fill-empty-only apply.
- [x] Responsive recent-search sidebar pills with query/category/AI restoration, ten-entry bound, saved and recently opened resource prioritization, clear/reset and guarded browser persistence.
- [x] Save/unsave controls and one-click local JSON export from the full saved catalog, regardless of active search/filter; disabled empty export and browser-download feedback.
- [x] TypeScript, all 158 automated tests and production frontend/server build pass.
- [x] Phone (390px), tablet (820px) and desktop (1440px) checks pass: greeting switching, no implicit AI calls, consent gates, editing/playback, styles, local draft review and preservation of existing slide content.
- [x] Phone/tablet/desktop directory checks pass: submit-only history, restore pills, saved card persistence across tab/reload, actual JSON downloads, clicked/saved reprioritization, reset to original nine cards and no horizontal overflow.
- [x] Mobile blocked-storage test confirms directory renders and session-only history works without crashing.
- [x] One real GPT-6 Luna structured greeting smoke test passes using synthetic, nonpersonal context; no database records or founder contact data were submitted.

Provider generation remains authenticated and explicitly consent-gated. Native LiveKit conversation, autonomous deck-control agents, phone connections, GitHub push and public publication are not falsely claimed complete. Existing 99 catalog entries, source limitations, protected waitlist and bottom Everything Startups attribution remain preserved.

## November 18 — recent-search pill hover polish

- [x] Add scoped 180ms eased violet color/glow transitions and a subtle 2px hover lift on recent-search pills; restrict hover lift to fine hover-capable pointers and retain 44px touch targets.
- [x] Keep keyboard focus instant and reduced-motion transform/transition disabled; preserve search restoration and directory state.
- [x] Pass TypeScript, all 161 automated tests, production build and real-browser desktop, reduced-motion and touch-phone checks with no horizontal overflow.

## November 18 — finalizations and verified Founder Services

- [x] Add individual history deletion, preserve active search/saved data and restore keyboard focus; verify persistence and 44px touch targets.
- [x] Add saved-export spinner, duplicate-export guard, success/error toasts, snapshot data and cleanup; verify real JSON downloads and retryable failure states.
- [x] Add Brief/Generate/Review/Preview step trail and actual slide-position progress, with no invented generation percentages or readiness claims.
- [x] Verify and add 14 external resources, including eight Founder Services; retain all previous 99 entries, nine-card loading and Everything Startups bottom attribution.
- [x] Place Yoodli/PitchBob/Papermark in Pitch, Perspective AI/Outset/Strella in Validate, and investor-sharing/equity links in the application workspace. All additions are External Resource, not affiliates or connected integrations.
- [x] Pass TypeScript, 182 tests, production build and actual phone/tablet/desktop finalization and service-placement checks with no horizontal overflow.
- [x] Create available-checkout infrastructure inventory; explicitly mark account-wide Vercel inspection/migration blocked. No cancellations, DNS changes, payments or fake investor records.
- [x] Preserve commercial, infrastructure/IP and YC founder-stack attachments as separate work orders and provide an updated source ZIP.

## Next-phase specifications, not completed capabilities

The broader YC financial-stack registry and Perks Vault require provider-level verification of eligibility, current offers, pricing, status and API support. The supplied headline counts and financial-stack relationships are not treated as established facts. Secure IP records, persistent readiness milestones, billing/usage ledger, native agents and Investor Pressure Chamber also remain separate acceptance-tested implementation phases. Previous user-controlled authentication, device-access and publication checks remain pending; no checkbox is marked complete merely to satisfy a release checklist.

## November 18 — Forum reference and verified financial registry

- [x] Read official Studio, Foundry, Accelerator, Pre-Seed Fund, Industry Council and website terms; save source-backed distinctions and disclosure limits without copying branding, testimonials or funding promises.
- [x] Analyze the silent 31.8-second Ghost in the Droid reference; preserve supplied images outside deployment and do not reopen them with file-view tools.
- [x] Add original domain-insight homepage story with separate concept and existing-product entry actions.
- [x] Implement local Forum Program Finder with unknown-by-default qualification, separate talent route, non-B2B safeguards, passed-cohort caution and resettable disclosure review. No founder data is sent externally.
- [x] Complete approved 27-provider verification; preserve raw evidence and Unknown fields; add 27 deduplicated provider/program records for total 140 directory entries while retaining previous113.
- [x] Implement Financial Infrastructure search/filter/paging and max-three comparison, with conditional Mercury/Carta marketplace views and explicit sunset/expired-offer restrictions.
- [x] Integrate into existing studio/application workspaces, preserve four primary tabs and nine main studio choices, keep Application Engine under More workspaces, and preserve history/favorites/Everything Startups attribution.
- [x] Pass TypeScript, all 257 tests, production build and actual phone/tablet/desktop routing, disclosure, comparison, filter, paging and no-overflow checks.

The earlier next-phase research paragraph is superseded only for the public registry and comparison features above. Guided financial account configuration, operational Joyce/Venture Record integration, secure IP records, investor CRM/Pressure Chamber, billing and native phone/audio agent deployment remain pending. Those items are not marked done by source verification or local UI controls. Source ZIP and checkpoint are reviewable releases, not proof of a GitHub push or production publication.
