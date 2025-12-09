import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pl";

dayjs.extend(relativeTime);
dayjs.locale("pl");

export function parseDate(dateInput: any): Date | null {
  if (!dateInput) return null;

  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === "object" && "_seconds" in dateInput) {
    return new Date(dateInput._seconds * 1000);
  }
  if (typeof dateInput.toDate === "function") {
    return dateInput.toDate();
  }
  return new Date(dateInput);
}
export function formatDate(date: any, format = "DD.MM.YYYY HH:mm") {
  const d = parseDate(date);
  if (!d) return "—";
  return dayjs(d).format(format);
}

export function formatSmartDate(date: any) {
  const d = parseDate(date);
  if (!d) return "";

  if (Math.abs(dayjs().diff(d, "hour")) > 24) {
    return dayjs(d).format("D MMMM YYYY");
  }
  return dayjs(d).fromNow();
}
