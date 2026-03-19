import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pl";

dayjs.extend(relativeTime);
dayjs.locale("pl");

type DateInput =
  | Date
  | string
  | number
  | { _seconds: number }
  | { toDate(): Date };

export function parseDate(dateInput: Date | null | undefined): Date | null {
  if (!dateInput) return null;

  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === "object" && "_seconds" in dateInput) {
    return new Date(dateInput._seconds * 1000);
  }
  if (typeof dateInput === "object" && "toDate" in dateInput) {
    return dateInput.toDate();
  }
  return new Date(dateInput);
}

export function formatDate(date: DateInput | null | undefined, format = "DD.MM.YYYY HH:mm") {
  const d = parseDate(date);
  if (!d) return "—";
  return dayjs(d).format(format);
}

export function formatSmartDate(date: DateInput | null | undefined) {
  const d = parseDate(date);
  if (!d) return "";

  if (Math.abs(dayjs().diff(d, "hour")) > 24) {
    return dayjs(d).format("D MMMM YYYY");
  }
  return dayjs(d).fromNow();
}
