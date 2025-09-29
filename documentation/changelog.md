# Changelog — IntelliSMART AI Factory

Date: 2025-09-29
Owner: Engineering
Scope: Append-only record of notable changes after initial demo publication.

## 2025-09-29
- Added Operations Guide (documentation/operations.md) with reboot instructions, dev/prod runbooks, and cache clear steps.
- Hardened real-time SSE teardown and added transport_update channel (already reflected in /api/events).
- Autonomous Transport: data model and SSE event in backend; wiring UI work in Portal started (Domain card & controls to follow).
- Documentation: updated security-design.md for SSE teardown notes and security features summary.
- Fix: Removed stray artifact from tenant-login page (if present), and ensured placeholder pages render cleanly.

## 2025-09-28
- Cameras and Security Scan APIs implemented with tenant scoping and SSE.
- Portal wired to agents, cameras, and security alerts with real-time updates.
- Added needtofix.md audit and documentation set (as-built, sitemap, site-design, security-design).
- Git initialized; .gitignore added; base README expanded with backend and demo instructions.
