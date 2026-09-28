# Process overview

## What I built

Due: every ANU deadline across my courses on one board, banded by urgency and
labelled with grade weight, in SQLite on the Fly volume. `README.md` says what
good means here and what I cut.

## How I got here

The system that ruins my week is the gap between Wattle sites, so I took
deadlines as the slice and chose urgency-plus-weight over a plain checklist. I
kept the default stack so the effort went on the data model.

I deployed the untouched starter first. The first token I found on Ed was for
my final-project app, so before storing anything I had the agent run
`flyctl status` with each token against both app names, and only the one that
could see `comp4020-crit7` went into the repo.

The spec's persistence line became tests before any feature code, committed
red in
[`bbd379c`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-peacefulmind43/commit/bbd379c).
The key one restarts the server on the same database, because a reload alone
can't tell SQLite from an in-memory array.

[`bc0fe1f`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-peacefulmind43/commit/bc0fe1f)
turned them green with `courses` and `deadlines` tables, with the course-code
and weight rules held as schema `CHECK`s as well as in the handler. Two
corrections came up. drizzle-kit's rename prompt can't run non-interactively,
so the migration was split into add-then-drop rather than guessed. Headless
Chrome won't lay out below 500px, so the phone check moved into a 375px iframe.
Both became rules in `CLAUDE.md` in
[`08ad3e4`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-peacefulmind43/commit/08ad3e4).

To confirm it was right, `pnpm check` is green. On the live app I re-ran CI's
post-deploy probes, then added a deadline, restarted the Fly machine and saw it
survive.
