# Process overview

## What I built

Due, a single board for every ANU deadline across all my courses, sorted by
urgency and labelled with grade weight, persisted in SQLite on the Fly volume
and live at <https://comp4020-crit7-peacefulmind43.fly.dev/>. `README.md` says
what good means here and what I cut.

## How I got here

**Choosing the slice.** The brief asks for the ANU system that ruins my week.
For me that isn't one system but the gap between them: every course keeps its
deadlines on its own Wattle page, and the cross-course view lives in my head. I
picked deadlines as the slice, then chose between a plain list with checkboxes
and a list that makes urgency and weight visible. I took the second, because a
list that doesn't tell me what to do first is just Wattle in one place. I kept
the course's default stack (Astro, Drizzle, SQLite) so my effort went on the
data model rather than plumbing.

**Deploy path first.** Before any code I deployed the untouched starter to prove
the token and the Fly path. That's where the week's first correction happened:
the first token I found on Ed was for my *final-project* app, not crit 7. Rather
than writing it into `mise.local.toml` and finding out at deploy time, the agent
ran `flyctl status` with each candidate token against both app names. The first
token could only see `comp4020-final`, and the crit 7 one only `comp4020-crit7`,
so only the right one went into the repo. I'm now doing that check before
storing any credential.

**Contract before code.** I turned the spec's persistence line into tests
before any feature code existed, and committed them red in
[`bbd379c`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-peacefulmind43/commit/bbd379c).
They drive the built server over HTTP: a deadline survives a reload *and* a
server restart on the same database (a reload alone can't tell SQLite from an
in-memory array), ticking off persists, the board is soonest first, each
urgency band is labelled, and a malformed course code is refused and not
stored. They assert what the page does, not how it's built.

**The board.**
[`bc0fe1f`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-peacefulmind43/commit/bc0fe1f)
replaced the guestbook with two tables, `courses` and `deadlines`, joined by a
foreign key. The course-code rule and the weight range are held twice: in the
handler for a readable error, and as `CHECK` constraints so a bypassed handler
still can't store a bad row. Due times are stored as Canberra wall time, the
clock ANU publishes on. Two things needed correcting along the way.
`drizzle-kit generate` stopped to ask whether `messages` had been *renamed* to
`courses`, a prompt it can't answer non-interactively. Instead of guessing, the
change became two migrations, add then drop. Then the phone screenshot looked
clipped. The agent measured the viewport and found headless Chrome refuses to
lay out below 500px, so the real 375px check had to be done inside an iframe.
Once it was, the layout held. Both traps went into `CLAUDE.md` as rules in
[`08ad3e4`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-peacefulmind43/commit/08ad3e4),
so they aren't rediscovered next time.

**How I know it's right.** `pnpm check` is green: typecheck, the invariants and
axe floor on every route including the filtered and error states, and the
contract tests. On the live app I re-ran the probes CI will run after shipping
(SSE opens immediately, same-origin POST accepted, cross-site POST refused).
Then I added a deadline, restarted the Fly machine and confirmed it was still
there, which is the persistence claim tested against the real volume, not a
temp file.

The whole arc is
[`d6e22e9...08ad3e4`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-peacefulmind43/compare/d6e22e9...08ad3e4).
