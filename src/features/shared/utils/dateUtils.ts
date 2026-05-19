import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pl";
import type { Lang } from "@/i18n/translations";

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

export function formatDate(
  date: string | Date | null | undefined,
  format = "DD.MM.YYYY HH:mm",
  lang: Lang = "pl",
) {
  const d = parseDate(date);
  if (!d) return "—";
  return dayjs(d).locale(lang).format(format);
}

export function formatSmartDate(
  date: string | Date | null | undefined,
  lang: Lang = "pl",
) {
  const d = parseDate(date);
  if (!d) return "";

  if (Math.abs(dayjs().diff(d, "hour")) > 24) {
    return dayjs(d).locale(lang).format("D MMMM YYYY");
  }
  return dayjs(d).locale(lang).fromNow();
}
