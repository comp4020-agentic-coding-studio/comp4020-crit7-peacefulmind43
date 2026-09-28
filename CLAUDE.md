# Harness: Due (crit 7)

Due is a cross-course ANU deadline board. Read `README.md` for what good means
here before changing behaviour; the rules below are the ones that protect it.

## Data

- `src/lib/schema.ts` is the ground truth. Change it, run `pnpm db:generate`,
  and commit the migration with it. Never edit a migration that has shipped,
  and never touch the database by hand: the deployed volume outlives every
  deploy.
- `drizzle-kit generate` cannot answer its rename prompt non-interactively. If
  a change both drops and adds a table or column, split it into two migrations
  (add first, then drop) rather than guessing an answer to the prompt.
- Rules about valid data live in both places: the handler (for a readable
  error) and a schema `CHECK` or constraint (so a bypassed handler still can't
  store a bad row). Course codes are `[A-Z]{4}[0-9]{4}`; weight is an integer
  0–100 or null.
- Due times are Canberra wall time stored as `YYYY-MM-DDTHH:MM`. Compare them
  only through `src/lib/time.ts`. Never use `new Date()` on a stored `dueAt`
  directly or format it in the server's local zone.

## Behaviour

- Every write is a plain HTML form POST that answers `303` back to the board.
  No write may depend on client-side JavaScript.
- Keep `/api/events` sending its opening comment immediately: CI's
  post-deploy probe reads it. Emit `change` on the bus after every successful
  write.
- Keep the page's content in English and the urgency labels written out, not
  colour alone.

## Checks

- `pnpm check` must be green before every commit. Contract tests live in
  `spec/deadlines.test.ts`; assert what the page does over HTTP, not how it's
  built.
- Any new page or query-string state gets added to `spec/routes.ts`, or the
  invariants stop covering it.
- Changing layout means checking it in a real browser at desktop width and at
  375px. Headless Chrome won't lay out narrower than 500px at `--window-size`,
  so test phone width inside a 375px iframe.
- README images are raw `<img src="public/...">` tags, not markdown images:
  Astro sends markdown images through `/_image`, which needs `sharp`, and the
  production image doesn't have it. `spec/assets.test.ts` holds this.
- Leave `fly.toml`, the `Dockerfile` and the CI workflow as the starter
  shipped them.
