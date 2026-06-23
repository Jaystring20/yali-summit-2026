# YALI Network Nigeria — Platform Roadmap

The AIDIFILN 2026 attendee portal is **v0** of a permanent platform for YALI
Network Nigeria. This document is the single source of truth for where the
product is going. Update it as we ship.

---

## Vision

A federated digital home for young African leaders across all 36 Nigerian
states + the FCT. Members connect across hubs, collaborate on sector-based
projects, run their own events, and roll real impact up to a national view.

12-month success: every checked-in summit attendee has an active account,
every State Hub has a live page with a coordinator, and at least one
cross-hub project is tracked end-to-end.

24-month success: the platform hosts multiple events per year, opportunities
and mentorship flow through it, and a public impact dashboard makes YALI
Nigeria's work visible to partners and press.

---

## Architectural principles

- **Multi-hub identity** — members can affiliate with many hubs (home,
  diaspora, sector-based). Never forced to pick one.
- **Events are generic** — AIDIFILN is the first instance of a generalized
  `events` model that lands in Phase 4.
- **Federation, not centralization** — hubs are autonomous; the national
  layer aggregates, it does not gate.
- **PWA-first** — works on low-bandwidth Android; no native apps planned.
- **RLS everywhere** — service-role keys only inside server functions.
- **Additive migrations** — every phase lists the exact schema diff; we
  resist mid-phase columns.

---

## Phase 1 — Summit portal (now)

Account + ticket claim, agenda bookmarks, hackathon/pitch entry, networking
gated by check-in, profile settings. Future-proofing tweaks already landed:

- `attendee_profiles.home_state` (mirrored from registrations on claim)
- `attendee_profiles.hub_affiliations text[]` (empty placeholder)
- `attendee_profiles.sectors text[]` (empty placeholder)
- `attendee_profiles.linkedin_sub` (nullable; populated by Phase 2 OAuth)
- `attendee_profiles.is_active_member`
- `app_role` enum gains `hub_admin` (no UI yet)

Naming caveats to migrate later:

- `session_bookmarks.session_id` is a static slug from `src/lib/event-data.ts`
  — becomes `event_sessions.id` in Phase 4.
- `hackathon_entries` is summit-scoped — becomes `event_submissions` in
  Phase 4.

## Phase 2 — Post-summit "stay connected"

- Open the member directory beyond checked-in users (verified members).
- LinkedIn OAuth — populates `linkedin_sub`, replaces pasted URLs.
- Lightweight async member-to-member messaging.
- Email digest (hub activity, opportunities).
- Privacy reset: `networking_opt_in` flips to false post-summit until the
  member re-confirms.

## Phase 3 — State Hubs as first-class entities

New tables:

```text
hubs            (id, slug, state, name, focus_areas[], coordinator_user_id)
hub_members     (hub_id, user_id, role, joined_at)   -- multi-hub join table
hub_posts       (hub_id, author_user_id, title, body, published_at)
```

- Hub pages at `/hubs/<slug>` replace the static marquee in `StateHubs.tsx`.
- `hub_admin` role activated; coordinators manage their hub page + posts.
- Members join/leave hubs from `/profile/settings` (the teaser card ships).
- National admins can grant/revoke `hub_admin`.

## Phase 4 — Generic events platform

```text
events                 (id, slug, name, host_hub_ids[], starts_at, ends_at, …)
event_registrations    (replaces registrations; FK events)
event_submissions      (replaces hackathon_entries; type='hackathon'|'pitch'|'project')
event_sessions         (replaces static event-data.ts; FK events)
session_bookmarks      (already generic; session_id → event_sessions.id)
```

One-shot backfill: existing AIDIFILN data lands in `events` row id=1. Any
hub can publish events; cross-hub events list multiple `host_hub_ids`.

## Phase 5 — Inter-hub collaboration & impact

```text
projects         (id, slug, name, sectors[], owner_hub_ids[])
collaborations   (project_id, hub_id | user_id, role)
impact_metrics   (project_id | hub_id, kpi, value, period, evidence_url)
audit_log        (actor_user_id, action, target, payload, at)
```

- Sector pages (`/sectors/<slug>`) aggregate cross-hub work.
- Public impact dashboard per hub + national rollup at `/impact`.

## Phase 6 — Engagement layer

- On-demand masterclass library.
- Mentorship matching (skills / sectors based).
- Opportunities board (grants, fellowships, jobs) — hub admins post.
- Push notifications via the installed PWA.
- Public stats API for partners / press.

---

## Data model evolution (cumulative)

| Phase | Tables added                                                |
|------:|-------------------------------------------------------------|
| 1     | attendee_profiles, session_bookmarks, hackathon_entries, hackathon_team_members, networking_connections |
| 2     | messages, message_threads, email_digest_log                 |
| 3     | hubs, hub_members, hub_posts                                |
| 4     | events, event_registrations, event_submissions, event_sessions (refactor) |
| 5     | projects, collaborations, impact_metrics, audit_log         |
| 6     | masterclasses, mentorships, opportunities, push_subscriptions |

---

## Decision log

- **2026-05-31 — Multi-hub identity.** Members can affiliate with many hubs.
  Reflects real YALI structure (diaspora, cross-state collaborators) and
  avoids forced relocation when members move.
- **2026-05-31 — Future-proof Phase 1.** Added `home_state`,
  `hub_affiliations`, `sectors`, `linkedin_sub`, `is_active_member` to
  `attendee_profiles` and `hub_admin` to `app_role` now. Cheap; avoids a
  Phase 3 migration that would touch every member row.
- **2026-05-31 — LinkedIn deferred.** Column lands now; OAuth wiring waits
  for Phase 2 to avoid scope creep into the summit critical path.
- **2026-05-31 — Hub coordinators NOT seeded.** No placeholder admin
  accounts in Phase 1 — security surface without UI benefit. Seed in
  Phase 3 when the hub UI lands.

---

## Risks & mitigations

- **Schema sprawl** — each phase lists its exact diff above; no mid-phase
  additions without a decision-log entry.
- **Hub admin abuse** — national admins can demote; `audit_log` lands in
  Phase 5.
- **Privacy regression** — opening the directory in Phase 2 requires an
  explicit per-member opt-in (the existing `networking_opt_in` flag).
- **Vendor lock** — Supabase + TanStack Start; no platform-specific
  features that prevent self-hosting later.

---

## Open questions

- *Phase 3:* Are coordinators always individuals, or can a hub be
  co-led by 2+ people? (Leaning co-lead — `hub_members.role='coordinator'`.)
- *Phase 4:* Do we allow paid events with revenue split between hubs, or
  keep events free until Phase 5+?
- *Phase 6:* Mentorship matching — manual curation or algorithmic? Likely
  start manual, add scoring later.