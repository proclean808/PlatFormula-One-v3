# PlatFormula.One V3 — infrastructure dependency inventory

**Inspection date:** November 18, 2026. **Migration status: NOT CLEARED.** This is a verified inventory of the available V3 checkout plus known deployment references, not a completed account-wide Vercel audit. No subscriptions, deployments, DNS records or provider settings were changed.

## Available V3 application

The inspected working source is the managed `platformula-one-restored` project, now containing the Version 3 application. Its current Git remote is Manus-managed artifact storage, not the requested `proclean808/PlatFormula-One-v3` repository. GitHub should become the canonical source after an authenticated push or the founder's manual upload of the source ZIP. Neither remote creation nor a successful GitHub push is established by this inventory.

The build uses React, Vite, TypeScript, Express and tRPC. `pnpm build` creates a client bundle and `dist/index.js`. Keep source, lockfile, migrations and release notes together; build artifacts alone are not a complete backup. The managed address assigned to the project is `platformula-one.manus.space`. The `platformula.one` custom domain was previously observed using IONOS frame forwarding; its current provider configuration has not been re-inspected here.

## Dependencies that must survive migration

- **Database:** Drizzle/MySQL uses `DATABASE_URL`. The checkout defines `users` and `waitlistEntries`. Export and restore the database independently of source code; validate consent records, unique-user constraints and signed-in enrollment without exposing unrelated records.
- **Authentication:** Manus OAuth depends on `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL`, `OAUTH_SERVER_URL`, `JWT_SECRET` and owner configuration. `/api/oauth/callback` and session-cookie behavior must be tested on the final origin. Never assume a callback from another domain will continue working.
- **API routing:** `/api/trpc` must reach the Express server. Test protected founder-assistant and draft endpoints, public auth state and wait-list behavior after deployment.
- **Model and asset services:** `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` and the frontend Forge configuration are platform-specific dependencies. `/manus-storage/*` resolves hosted artwork through the server proxy. A generic Vercel copy must replace or preserve these services deliberately; the source ZIP does not provision them.
- **Browser data:** Pitch slides and founder records use IndexedDB. Directory favorites, recent searches, preferences and the local founder brief use browser storage. These are origin-specific, not a replicated server database. A domain change does not automatically carry them across; export before migration. Storage-denied mode must remain functional.
- **Runtime variables:** Additional discovered names include `NODE_ENV`, `PORT`, `OWNER_OPEN_ID`, `VITE_FRONTEND_FORGE_API_URL` and `VITE_FRONTEND_FORGE_API_KEY`. This inventory records names only, never values. Transfer credentials through provider secret controls rather than Git or ZIP files.
- **Schedules and webhooks:** None were identified in the inspected active server routes. This is not proof that no external provider schedules or webhooks exist. Audit the provider accounts before cancellation.
- **Native conversation and phones:** No running LiveKit worker or verified Botcast Arena phone connection is established by this checkout. Those require separate projects, credentials, authorization, persistent hosting and real-device acceptance tests. Links to external tools do not connect agents.
- **Billing:** No new Stripe checkout, subscription or usage-ledger workflow was activated in this finalization. Proposed pricing and entitlements in the supplied product work order remain specifications, not live services.

## Vercel account inventory — access blocked

The current session reports Vercel and GitHub connectors as disabled. No Vercel CLI or local `.vercel/project.json` was found. No connection enablement or login loop was initiated. Therefore, account-wide project IDs, owner/team scope, production aliases, environment-variable presence, databases, schedules, webhooks, callback URLs, deployment history and rollback snapshots are **UNKNOWN**, not absent.

The founder supplied `pf1-command-hub-proclean808s-projects.vercel.app`; the earlier browser attempt encountered Vercel authentication. Its current production dependencies cannot be verified without authorized account access or an exported inventory. `proclean808/platformula-one-live` was also mentioned in a previous work order; its connection to a particular Vercel deployment is not confirmed.

Do not publish the addendum's Vercel price/project-limit statements as verified current facts based solely on the attachment. No plan change was researched or executed in this scope.

## Required go/no-go evidence before cancellation

1. Obtain a read-only list of every Vercel project and identify production versus preview aliases, including custom domains.
2. For each production project, record environment-variable names, data stores, uploads, scheduled jobs, webhooks, OAuth callbacks and external workers without exposing secrets.
3. Make separate source, database and asset backups; capture current deployment and domain-routing evidence.
4. Deploy independently to the selected commercial hosting environment. Test authentication, data restore, assets, protected APIs, browser exports and phone/tablet/desktop layouts.
5. Rehearse rollback and record the tested route, deployment version, recovery data and responsible operator.
6. Only after these checks pass, review the exact cancellation or DNS change with the founder. Current evidence does not authorize clearing this gate.

## Related specifications

`PRODUCT-EXPANSION-WORKORDER.md` contains the earlier proposed commercial platform expansion. `FOUNDER-INFRASTRUCTURE-WORKORDER.md` contains the IP and founder-services addendum. Those documents are requested work orders; they must not be interpreted as acceptance-test proof or implemented capability claims.
