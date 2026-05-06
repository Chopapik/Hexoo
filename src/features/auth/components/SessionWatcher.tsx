"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { ApiError } from "@/lib/AppError";
import fetchClient from "@/lib/fetchClient";
import { useAppStore } from "@/lib/store/store";
import Modal from "@/features/shared/components/layout/Modal";
import Button from "@/features/shared/components/ui/Button";

const SESSION_HEARTBEAT_MS = 60_000;

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
  const router = useRouter();

  const user = useAppStore((s) => s.auth.user);
  const clearUser = useAppStore((s) => s.clearUser);

  const hasHandledExpiry = useRef(false);

  const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);

  const closeModal = useCallback(() => {
    setIsExpiredModalOpen(false);
  }, []);

  const goToLogin = useCallback(() => {
    router.replace("/login");
  }, [router]);

  const openExpiredModal = useCallback(() => {
    if (!isAuthPage(pathname)) {
      setIsExpiredModalOpen(true);
    }
  }, [pathname]);

  const handleSessionExpired = useCallback(async () => {
    if (hasHandledExpiry.current) return;

    hasHandledExpiry.current = true;

    clearUser();

    try {
      await fetchClient.post("/auth/logout");
    } catch (error) {
      console.warn("Failed to clear session after expiry", error);
    }

    openExpiredModal();
  }, [clearUser, openExpiredModal]);

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
      setIsExpiredModalOpen(false);
    }
  }, [pathname]);

  const footer = (
    <div className="flex justify-end w-full gap-2">
      <Button
        onClick={goToLogin}
        text="Wróć do logowania"
        variant="secondary"
      />
      <Button onClick={closeModal} text="OK" />
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
