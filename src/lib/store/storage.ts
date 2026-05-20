export const readBoolean = (raw: string | null): boolean | null => {
  if (raw === null) return null;

  try {
    return JSON.parse(raw) as boolean;
  } catch {
    return null;
  }
};

export const readNumber = (raw: string | null): number | null => {
  if (raw === null) return null;

  const parsed = Number(raw);

  return Number.isFinite(parsed) ? parsed : null;
};

export const clampNumber = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const writeLocalStorage = (key: string, value: string) => {
  if (typeof window === "undefined") return;

  localStorage.setItem(key, value);
};

export const readEnumValue = <T extends string>(
  raw: string | null,
  allowedValues: readonly T[],
): T | null => {
  if (!raw) return null;

  return allowedValues.includes(raw as T) ? (raw as T) : null;
};
