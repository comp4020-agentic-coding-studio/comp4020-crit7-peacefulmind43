import type { APIRoute } from "astro";
import { deleteDeadline } from "../../../../lib/db";
import { bus } from "../../../../lib/events";

export const POST: APIRoute = ({ params, redirect }) => {
  if (deleteDeadline(Number(params.id))) bus.emit("change");
  return redirect("/", 303);
};
