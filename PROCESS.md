# Process overview

## What I built

I built Due. It is one board for all my ANU deadlines from every course. It
sorts them by urgency and shows each one's grade weight. The data is saved in
SQLite on the Fly volume. `README.md` explains what "good" means for this app
and what I did not build.

## How I got here

My problem is that every course has its own Wattle page, so I must remember all
the deadlines myself. So I chose deadlines. I wanted urgency and weight on the
board, not only a simple checklist. I used the default stack.

First I deployed the starter. The first token I found on Ed was for my final
project app, not crit 7. Before saving it, I asked the agent to test each token
against both app names with `flyctl status`. Only the token that worked for
`comp4020-crit7` went into the repo.

Next I wrote tests for the spec before writing any feature code. They were red
in
[`bbd379c`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-peacefulmind43/commit/bbd379c).
The most important test restarts the server with the same database. A page
reload alone cannot show the data is really in SQLite.

[`bc0fe1f`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-peacefulmind43/commit/bc0fe1f)
made the tests green. It has two tables, `courses` and `deadlines`. The course
code and weight rules are checked in the handler and also in the schema. I had
two problems. drizzle-kit asked a rename question that cannot run here, so I
split the migration into two steps. Headless Chrome does not go smaller than
500px, so I checked the phone size inside a 375px iframe. I added both as rules
in `CLAUDE.md` in
[`08ad3e4`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-peacefulmind43/commit/08ad3e4).

`pnpm check` is green. On the live app I added a deadline, restarted the Fly
machine, and the deadline was still there.
