# Crit 7 reflection

## What was the breakthrough that moved the work forward?

The breakthrough was the test that restarts the server with the same database.
Before, I only thought about reloading the page. But a reload test can pass
even if the data is only in memory, so it does not prove the spec says "still
there". Starting a new server on the same file does prove it. When this test
was written and red, the rest of the week was easy to plan. I built the two
tables and made the test green. Then I did the same check on the real Fly
volume by restarting the machine. After that, I did not only say the data
persists. I could show it.

## What did this work change about who I want to be as a software developer?

The token mistake taught me the most. I had a token that looked right, and the
fast thing was to paste it and deploy. But it was the wrong one, and the deploy
would fail. Then I would waste time fixing the deploy, not the real problem.
Testing each token against both apps took only a few seconds. The same thing
happened two more times. drizzle asked if a table was renamed, and a guess
could give the wrong answer. The phone screenshot looked broken, but the
problem was the tool, not my page. Every time, the right step was to check
first and then act. I want to be a developer who checks the easy facts first.
I also want to write them in the harness, so the agent and I don't need to
learn the same thing again.
