"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { ApiError } from "@/lib/AppError";
import fetchClient from "@/lib/fetchClient";
import { useAppStore } from "@/lib/store/store";
import Modal from "@/features/shared/components/layout/Modal";
import Button from "@/features/shared/components/ui/Button";

const SESSION_HEARTBEAT_MS = 60_000;
const SESSION_EXPIRED_MODAL_DELAY_MS = 2_000;

function isSessionExpiredError(error: unknown) {
  return (
    error instanceof ApiError &&
    (error.status === 401 ||
      error.code === "AUTH_REQUIRED" ||
      error.code === "INVALID_SESSION" ||
      error.code === "NO_SESSION")
  );
}

function isAuthPage(pathname: string) {
  return pathname === "/login" || pathname === "/register";
}

export default function SessionWatcher() {
  const pathname = usePathname();

  const user = useAppStore((s) => s.auth.user);
  const clearUser = useAppStore((s) => s.clearUser);

  const hasHandledExpiry = useRef(false);
  const modalTimeoutRef = useRef<number | null>(null);
  const pathnameRef = useRef(pathname);

  const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const clearModalTimeout = useCallback(() => {
    if (modalTimeoutRef.current === null) return;

    window.clearTimeout(modalTimeoutRef.current);
    modalTimeoutRef.current = null;
  }, []);

  const closeModal = useCallback(() => {
    clearModalTimeout();
    setIsExpiredModalOpen(false);
  }, [clearModalTimeout]);

  const scheduleExpiredModal = useCallback(() => {
    clearModalTimeout();

    modalTimeoutRef.current = window.setTimeout(() => {
      modalTimeoutRef.current = null;

      if (isAuthPage(pathnameRef.current)) {
        return;
      }

      setIsExpiredModalOpen(true);
    }, SESSION_EXPIRED_MODAL_DELAY_MS);
  }, [clearModalTimeout]);

  const handleSessionExpired = useCallback(async () => {
    if (hasHandledExpiry.current) return;

    hasHandledExpiry.current = true;

    clearUser();

    try {
      await fetchClient.post("/auth/logout");
    } catch (error) {
      console.warn("Failed to clear session after expiry", error);
    }

    scheduleExpiredModal();
  }, [clearUser, scheduleExpiredModal]);

  useEffect(() => {
    if (!user) {
      hasHandledExpiry.current = false;
      return;
    }

    let isActive = true;

    const heartbeat = async () => {
      try {
        await fetchClient.get("/auth/session");
      } catch (error) {
        if (!isActive) return;

        if (isSessionExpiredError(error)) {
          await handleSessionExpired();
        }
      }
    };

    void heartbeat();

    const intervalId = window.setInterval(() => {
      void heartbeat();
    }, SESSION_HEARTBEAT_MS);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [user, handleSessionExpired]);

  useEffect(() => {
    if (isAuthPage(pathname)) {
      clearModalTimeout();
      setIsExpiredModalOpen(false);
    }
  }, [pathname, clearModalTimeout]);

  useEffect(() => {
    return () => {
      clearModalTimeout();
    };
  }, [clearModalTimeout]);

  const footer = (
    <div className="flex justify-end w-full">
      <Button onClick={closeModal} text="Wróć do logowania" />
    </div>
  );

  if (!isExpiredModalOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title="Sesja wygasła"
      footer={footer}
      className="max-w-md"
    >
      <div className="p-4  text-text-main text-base leading-relaxed">
        Twoja sesja wygasła. Zaloguj się ponownie, aby kontynuować.
      </div>
    </Modal>
  );
}
