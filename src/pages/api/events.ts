import type { APIRoute } from "astro";
import { bus } from "../../lib/events";

// Server-sent events: every open board hears "change" when any tab adds,
// ticks off or deletes a deadline. CI's post-deploy probe also reads the
// opening comment, so it must be sent immediately.
export const GET: APIRoute = () => {
  let onChange: () => void;
  let heartbeat: ReturnType<typeof setInterval>;

  const stream = new ReadableStream<string>({
    start(controller) {
      controller.enqueue(": connected\n\n");
      heartbeat = setInterval(() => controller.enqueue(": ping\n\n"), 30_000);
      onChange = () => controller.enqueue("event: change\ndata: {}\n\n");
      bus.on("change", onChange);
    },
    cancel() {
      clearInterval(heartbeat);
      bus.off("change", onChange);
    },
  });

  return new Response(stream.pipeThrough(new TextEncoderStream()), {
    headers: { "content-type": "text/event-stream", "cache-control": "no-cache" },
  });
};
