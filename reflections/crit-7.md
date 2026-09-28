# Crit 7 reflection

## What was the breakthrough that moved the work forward?

Writing the persistence test so it restarts the server on the same database,
not just reloads the page. A reload test passes just as happily against an
in-memory array as against SQLite, so it can't tell me whether the spec's
"still there" is true. Booting a second server on the same file can. Once that
test existed and was red, the rest of the week was a straight line: build the
two tables, get it green, then repeat the same claim against the real Fly
volume by restarting the machine. The spec line stopped being something I'd
assert at the crit and became something I could show.

## What did this work change about who I want to be as a software developer?

The token mix-up stuck with me more than any of the code. I had a credential in
hand that looked right, and the fastest move was to paste it in and deploy. It
would have failed, and I'd have spent the time debugging the deploy instead of
the input. Checking each candidate against both apps first took seconds. The
same shape came back twice more: drizzle's rename prompt, where guessing an
answer would have silently kept the old table's history under a new name, and
the "clipped" phone screenshot, which turned out to be the tool rather than the
page. Each time the right move was to measure before acting. I want to be the
developer who checks the cheap fact first, and who writes it down in the
harness so neither I nor the agent has to learn it again.
