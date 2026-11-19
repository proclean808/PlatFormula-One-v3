# Android Native Agent Capability Audit — 2026-11-18

Status: Research verified; device-specific execution NOT verified.

## Primary discovery
Google Connected Console documents a developer workflow for publishing Android MCP Connected Apps with AppFunctions callable from Gemini. This is a candidate integration for CommanDroid, not evidence that third-party agents inherit Gemini system permissions.

Sources:
- https://developer.android.com/ai/appfunctions
- https://developer.android.com/ai/appfunctions/create-manage-connected-apps
- https://developer.android.com/ai/appfunctions/create-manage-connected-apps
- https://support.google.com/android/answer/18921033
- https://android-developers.googleblog.com/2026/02/the-intelligent-os-making-ai-agents.html

## Architecture decision candidates
1. P0: Inventory Gemini native device actions separately on S25 Ultra and S26 Ultra. Record OS/One UI versions, assistant settings, app permissions, actual result, user confirmations, and time to completion.
2. P0: Prototype CommanDroid-owned AppFunctions in a dedicated Android test application. Confirm SDK prerequisites and access to Connected Apps developer preview.
3. P0: Distinguish direct function invocation from visual screen automation and ordinary assistant settings intents. Never assume equivalent access.
4. P1: Add execution adapter capability registry: function, device, required permission, confidence, audit evidence, fallback.
5. P1: Preserve Termux/Shizuku/Accessibility bridges until measured replacements pass acceptance tests.
6. P1: Verify restart behavior and service health separately; Android may restrict background execution.
7. P1: Use signed grants and independent result verification for any destructive or sensitive action.

## Evidence protocol
Each test: requested action; device; app and OS version; granted permission; execution route; before/after observation; timestamp; VERIFIED/FAILED/BLOCKED. No simulated success claims.

## Important restrictions
- AppFunctions is experimental; callers need EXECUTE_APP_FUNCTIONS authorization.
- Android 17 Automation permissions apply only where supported by the device/software.
- Gemini screen automation is beta and supports select apps; access is not universal.
- Native Samsung/Gemini access cannot be assumed available to Claude/ChatGPT/CommanDroid.

## Current state
Public documentation verified. No physical phone test, APK build, Google approval, or production integration performed.
