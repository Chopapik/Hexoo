"use client";

import React, { useEffect, useRef } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setUser, clearUser, setReady } from "@/features/auth/store/authSlice";
import { useCriticalError } from "@/features/shared/hooks/useCriticalError";

type ApiUser = {
  uid: string;
  email?: string | null;
  name?: string | null;
  role?: string;
  avatarUrl?: string | null;
  updatedAt?: string | number | null;
};

type ApiMeResponse =
  | { ok: true; user: ApiUser; expiresAt?: number | null }
  | { ok: false };

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { handleCriticalError } = useCriticalError();
  const currentUser = useAppSelector((s) => (s as any).auth.user);
  const currentUserRef = useRef<typeof currentUser | null>(currentUser ?? null);
  const bcRef = useRef<BroadcastChannel | null>(null);
  const readySetRef = useRef(false);

  // keep ref in sync
  useEffect(() => {
    currentUserRef.current = currentUser ?? null;
  }, [currentUser]);

  const sameUser = (
    a: ApiUser | null | undefined,
    b: ApiUser | null | undefined
  ) => {
    if (!a || !b) return false;
    if (a.uid !== b.uid) return false;
    if (a.updatedAt && b.updatedAt)
      return String(a.updatedAt) === String(b.updatedAt);
    return (
      a.name === b.name &&
      a.email === b.email &&
      a.role === b.role &&
      a.avatarUrl === b.avatarUrl
    );
  };

  async function checkMe(signal?: AbortSignal) {
    try {
      const res = await axiosInstance.get<ApiMeResponse>("/auth/me", {
        signal,
      });
      if (res.status === 200 && (res.data as any).ok) {
        const data = res.data as { ok: true; user: ApiUser };
        const lastUser = currentUserRef.current;
        if (!lastUser || !sameUser(lastUser, data.user)) {
          dispatch(
            setUser({
              id: data.user.uid,
              name: data.user.name ?? "",
              email: data.user.email ?? "",
              role: data.user.role ?? "user",
              avatarUrl: data.user.avatarUrl ?? undefined,
              updatedAt: data.user.updatedAt ?? undefined,
            } as any)
          );
        }
      } else {
        dispatch(clearUser());
      }
    } catch (error: any) {
      if (error?.name === "CanceledError" || error?.name === "AbortError") {
        return;
      }
      if (error?.response?.status === 401) {
        dispatch(clearUser());
      } else {
        handleCriticalError(
          error instanceof Error ? error : new Error("Auth check failed")
        );
      }
    } finally {
      if (!readySetRef.current) {
        dispatch(setReady(true));
        readySetRef.current = true;
      }
    }
  }

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bcRef.current = new BroadcastChannel("auth");
        bcRef.current.onmessage = (ev) => {
          const msg = ev.data as { type?: string; user?: ApiUser };
          switch (msg?.type) {
            case "auth:logout":
              dispatch(clearUser());
              break;
            case "auth:profile:update":
              if (msg.user) {
                const u = msg.user;
                dispatch(
                  setUser({
                    id: u.uid,
                    name: u.name ?? "",
                    email: u.email ?? "",
                    role: u.role ?? "user",
                    avatarUrl: u.avatarUrl ?? undefined,
                    updatedAt: u.updatedAt ?? undefined,
                  } as any)
                );
              }
              break;
            default:
              break;
          }
        };
      }
    } catch (error) {}

    const ac = new AbortController();
    checkMe(ac.signal);

    const onVis = () => {
      if (document.visibilityState === "visible") {
        // nowy controller dla każdego checka
        const localAc = new AbortController();
        checkMe(localAc.signal);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      ac.abort();
      document.removeEventListener("visibilitychange", onVis);
      bcRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount-only

  return <>{children}</>;
}
