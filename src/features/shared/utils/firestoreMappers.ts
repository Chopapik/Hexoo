import { parseDate } from "@/features/shared/utils/dateUtils";

const isDateLike = (value: unknown): boolean => {
  if (!value || typeof value !== "object") return false;
  if (value instanceof Date) return true;
  return "_seconds" in value || typeof (value as { toDate?: unknown }).toDate === "function";
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object") return false;
  return Object.getPrototypeOf(value) === Object.prototype;
};

const deepMapDates = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => deepMapDates(item));
  }

  if (isDateLike(value)) {
    return parseDate(value) ?? value;
  }

  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = deepMapDates(val);
    }
    return result;
  }

  return value;
};

export const mapDatesFromFirestore = <T>(data: T): T =>
  deepMapDates(data) as T;
