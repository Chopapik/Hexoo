import type { SessionData } from "@/features/me/me.type";

declare global {
  interface Window {
    __HEXOO_BOOTSTRAP__?: {
      sessionUser: SessionData | null;
    };
  }
}

export {};
