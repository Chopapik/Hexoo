import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pl";

dayjs.extend(relativeTime);
dayjs.locale("pl");

export function parseDate(
  input: string | Date | null | undefined,
): Date | undefined {
  if (!input) return undefined;
  if (input instanceof Date) return input;
  const d = new Date(input);
  return isNaN(d.getTime()) ? undefined : d;
}

export function formatDate(date: string | Date | null | undefined, format = "DD.MM.YYYY HH:mm") {
  const d = parseDate(date);
  if (!d) return "—";
  return dayjs(d).format(format);
}

export function formatSmartDate(date: string | Date | null | undefined) {
  const d = parseDate(date);
  if (!d) return "";

  if (Math.abs(dayjs().diff(d, "hour")) > 24) {
    return dayjs(d).format("D MMMM YYYY");
  }
  return dayjs(d).fromNow();
}

export function formatLockoutTime(date: string | Date | number): string {
  const d = typeof date === "number" ? new Date(date) : parseDate(date);
  if (!d) return "—";
  return d.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
