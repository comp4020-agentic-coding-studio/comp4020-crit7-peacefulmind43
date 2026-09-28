const ZONE = "Australia/Canberra";
const HOUR = 3_600_000;

// "Now" as Canberra wall time in ms, on the same axis as a stored dueAt
// parsed as if it were UTC — so subtracting the two gives time left.
export function canberraNow(at = new Date()): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(at)
      .map((x) => [x.type, x.value]),
  );
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
}

const wall = (dueAt: string) => Date.parse(`${dueAt}:00Z`);

export type Urgency = "overdue" | "day" | "soon" | "week" | "later";

export const URGENCY_LABEL: Record<Urgency, string> = {
  overdue: "Overdue",
  day: "Within 24 hours",
  soon: "Within 3 days",
  week: "Within a week",
  later: "Later",
};

export function urgency(dueAt: string, now = canberraNow()): Urgency {
  const left = wall(dueAt) - now;
  if (left < 0) return "overdue";
  if (left < 24 * HOUR) return "day";
  if (left < 72 * HOUR) return "soon";
  if (left < 168 * HOUR) return "week";
  return "later";
}

export function timeLeft(dueAt: string, now = canberraNow()): string {
  const ms = wall(dueAt) - now;
  const abs = Math.abs(ms);
  const days = Math.floor(abs / (24 * HOUR));
  const hours = Math.floor((abs % (24 * HOUR)) / HOUR);
  const minutes = Math.floor((abs % HOUR) / 60_000);
  const span = days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  return ms < 0 ? `${span} ago` : `in ${span}`;
}

export function formatDue(dueAt: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(wall(dueAt)));
}
