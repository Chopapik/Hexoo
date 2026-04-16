"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/AppError";
import fetchClient from "@/lib/fetchClient";
import { supabaseClient } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store/store";
import Modal from "@/features/shared/components/layout/Modal";
import Button from "@/features/shared/components/ui/Button";

const SESSION_HEARTBEAT_MS = 60_000;

export default function SessionWatcher() {
  const router = useRouter();
  const user = useAppStore((s) => s.auth.user);
  const clearUser = useAppStore((s) => s.clearUser);

  const hasHandledExpiry = useRef(false);
  const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);

  const goToLogin = useCallback(() => {
    setIsExpiredModalOpen(false);
    router.replace("/login");
  }, [router]);

  const handleSessionExpired = useCallback(async () => {
    if (hasHandledExpiry.current) return;
    hasHandledExpiry.current = true;

    clearUser();

    await fetchClient.post("/auth/logout");

    setIsExpiredModalOpen(true);
  }, [clearUser]);

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

        if (
          error instanceof ApiError &&
          (error.status === 401 ||
            error.code === "AUTH_REQUIRED" ||
            error.code === "INVALID_SESSION" ||
            error.code === "NO_SESSION")
        ) {
          await handleSessionExpired();
        }
      }
    };

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event) => {
      if (!isActive) return;

      if (event === "SIGNED_OUT") {
        void handleSessionExpired();
      }
    });

    void heartbeat();

    const intervalId = window.setInterval(() => {
      void heartbeat();
    }, SESSION_HEARTBEAT_MS);

    return () => {
      isActive = false;
      subscription.unsubscribe();
      window.clearInterval(intervalId);
    };
  }, [user, handleSessionExpired]);

  const footer = (
    <div className="flex justify-end w-full">
      <Button onClick={goToLogin} text="Wróć do logowania" />
    </div>
  );

  if (!isExpiredModalOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={true}
      onClose={goToLogin}
      title="Sesja wygasła"
      footer={footer}
      className="max-w-md"
    >
      <div className="py-2 text-text-main text-base leading-relaxed">
        Twoja sesja wygasła. Zaloguj się ponownie, aby kontynuować.
      </div>
    </Modal>
  );
}
