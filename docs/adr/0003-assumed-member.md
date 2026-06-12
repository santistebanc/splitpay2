# ADR 0003: Assumed member (device-local identity)

**Status:** Accepted

## Context

Early design treated members as claimable slots: a `claimed_device_id` on each member row, with logic to prevent two devices from occupying the same slot. That implied enforceable identity without real authentication, added sync complexity, and conflicted with offline-first usage (multiple people editing one phone, or one person on multiple devices).

## Decision

- **Assumed member** — a per-group, per-device preference for which member row this client highlights as “me” in the UI. Stored in AsyncStorage on `KnownGroup`, not in SQLite or sync.
- **Assume** — the act of picking (or clearing) that preference at group create, join, or in Settings.
- Members are shared ledger slots only (`id`, `display_name`). Drop `claimed_device_id` from the `members` table.
- Multiple devices may assume the same member, or none. No server or peer validation.
- Assumption affects **presentation and form defaults only** — not permissions. Anyone in a group may edit any member, expense, or setting.
- **Member roster:** anyone may add, rename, or remove members. Remove is blocked when the member is referenced by expenses (contributions or allocations).
- **Stale assumption:** if the stored `member_id` no longer exists in the group, treat as no assumption until the user picks again in Settings.
- **Exit group:** remove the group from this device’s known-groups list and clear assumption. Shared group data (members, expenses) is untouched.
- **UI:** special styling / “(you)” on the assumed member’s name only — no copy rewriting to “you”, no reordering lists for assumption. Balances sort by debt (most in debt first).
- **Form defaults** when assumption is set: paid-by → assumed member; allocations → all members; settle → pre-fill payer/recipient from assumed member’s balance direction.
- **Device ID:** remove until a later sync/auth slice needs it. Do not couple anonymous device UUIDs to members.

## Consequences

- `CONTEXT.md` replaces Claim / Claimed member / Unclaimed member with Assume / Assumed member.
- `KnownGroup` gains optional `assumedMemberId`.
- Create and join flows include a skippable member picker with an explicit “None” option.
- Settings includes the same picker; S23 exit criteria become “exit removes group locally” instead of “exit frees slot”.
- Future real auth may replace or augment assumption; ledger math remains member-id-based.
