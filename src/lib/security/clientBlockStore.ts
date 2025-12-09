// lib/security/clientBlockStore.ts

const STORAGE_KEY = "hexoo_security_block";

export type StoredBlock = {
  type: "AUTH_BLOCK" | "THROTTLE";
  until: number;
  details: any;
};

export const saveBlock = (data: any, code: string) => {
  if (typeof window === "undefined") return;

  let until = 0;

  if (data.lockoutUntil?._seconds) {
    until = data.lockoutUntil._seconds * 1000;
  } else if (data.retryAfter) {
    until = data.retryAfter;
  } else {
    return;
  }

  const blockData: StoredBlock = {
    type: code === "RATE_LIMIT" ? "AUTH_BLOCK" : "THROTTLE",
    until,
    details: data,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(blockData));
};

export const getActiveBlock = (): StoredBlock | null => {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const data = JSON.parse(raw) as StoredBlock;
    const now = Date.now();

    if (data.until <= now) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
};

export const clearBlock = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};
