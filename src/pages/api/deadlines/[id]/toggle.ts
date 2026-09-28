import type { APIRoute } from "astro";
import { toggleDeadline } from "../../../../lib/db";
import { bus } from "../../../../lib/events";

export const POST: APIRoute = ({ params, redirect }) => {
  if (toggleDeadline(Number(params.id))) bus.emit("change");
  return redirect(`/#deadline-${params.id}`, 303);
};
