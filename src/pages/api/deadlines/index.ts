import type { APIRoute } from "astro";
import { addDeadline } from "../../../lib/db";
import { bus } from "../../../lib/events";

// Plain form POST + 303 back to the board, so adding works with no
// client-side JavaScript; other open tabs hear about it over /api/events.
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const field = (name: string) => String(form.get(name) ?? "");
  const error = addDeadline({
    course: field("course"),
    title: field("title"),
    due: field("due"),
    weight: field("weight"),
  });
  if (error) {
    const back = new URLSearchParams({ error, course: field("course"), title: field("title"), due: field("due"), weight: field("weight") });
    return redirect(`/?${back}#add`, 303);
  }
  bus.emit("change");
  return redirect("/", 303);
};
