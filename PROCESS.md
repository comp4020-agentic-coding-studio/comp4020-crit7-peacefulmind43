# Process overview

## What I built

I built Due. It is one board for all my ANU deadlines from every course. It
sorts them by how urgent they are and shows how much of the grade each one is
worth. The data is saved in SQLite on the Fly volume. `README.md` explains what
"good" means for this app and what I did not build.

## How I got here

For me, the problem is not one ANU system. The problem is that every course has
its own Wattle page, so I have to remember all the deadlines myself. So I chose
deadlines. I wanted urgency and weight on the board, not only a simple
checklist. I used the default stack, so I could spend my time on the data model.

First I deployed the starter with no changes. The first token I found on Ed was
for my final project app, not crit 7. Before saving it, I asked the agent to
test each token against both app names with `flyctl status`. Only the token
that worked for `comp4020-crit7` went into the repo.

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

To check it works, `pnpm check` is green. On the live app I ran the same checks
CI runs. Then I added a deadline, restarted the Fly machine, and the deadline
was still there.
