# SplitPay

An offline-first bill-splitting app for friend groups. Groups share a join code; members record who paid what and who shares each cost; the app computes balances and suggested settlements.

## Language

**Group**:
A shared space with a name, join code, currency, members, and expenses.
_Avoid_: Workspace, room, trip (as the primary term)

**Member**:
A named slot in a group. Money math always references member IDs; display names are cosmetic.
_Avoid_: User, participant, person

**Claimed member**:
A member slot bound to an authenticated identity on a device. That person is this member in the group.
_Avoid_: Owner, registered user

**Unclaimed member**:
A member slot with only a display name. Anyone in the group can record expenses against it; a future joiner may claim it.
_Avoid_: Placeholder user, guest

**Claim**:
The act of binding an authenticated identity to a member slot, at group creation or when joining.
_Avoid_: Login, register, assign user

**Expense**:
A recorded cost: an amount in integer cents, who paid, and which members share it.
_Avoid_: Transaction, charge, bill (as the stored record)

**Split**:
The link between an expense and a member who owes an equal share of that expense.
_Avoid_: Share line, allocation, portion

**Payment**:
A special expense where one member pays and the cost is split across exactly one other member. Used to record settling up.
_Avoid_: Transfer, payout, settlement (as the stored record)

**Balance**:
A member's net position in cents within a group. Positive means others owe them; negative means they owe others. Balances always sum to zero across the group.
_Avoid_: Debt, credit, running total

**Settlement**:
A computed suggestion for one member to pay another a specific amount to move balances toward zero. Not stored — derived on demand.
_Avoid_: Payment (as the suggestion), transfer list

**Activity**:
An append-only log of group events shown in a feed, with a human-readable summary of what happened.
_Avoid_: History, audit log, timeline

**Join code**:
The five-character code that lets someone join a group. Uppercase alphanumeric, excluding ambiguous characters.
_Avoid_: Invite link, PIN, room code
