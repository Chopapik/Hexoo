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
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (!user) {
      hasHandledExpiry.current = false;
      return;
    }

    const handleSessionExpired = async () => {
      if (hasHandledExpiry.current) return;
      hasHandledExpiry.current = true;

      clearUser();
      await fetchClient.post("/auth/logout").catch(() => {});
      setIsExpiredModalOpen(true);
    };

    const heartbeat = async () => {
      try {
        await fetchClient.get("/auth/session");
      } catch (error) {
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
      if (event === "SIGNED_OUT") {
        void handleSessionExpired();
      }
    });

    void heartbeat();
    const intervalId = window.setInterval(() => {
      void heartbeat();
    }, SESSION_HEARTBEAT_MS);

    return () => {
      subscription.unsubscribe();
      window.clearInterval(intervalId);
    };
  }, [user, clearUser]);

  const footer = (
    <div className="flex justify-end w-full">
      <Button onClick={goToLogin} text="Wróc do logowania" />
    </div>
  );

  return (
    <Modal
      isOpen={isExpiredModalOpen}
      onClose={goToLogin}
      title="Sesja wygasla"
      footer={footer}
      className="max-w-md"
    >
      <div className="py-2 text-text-main text-base leading-relaxed">
        Twoja sesja wygasla. Zaloguj sie ponownie, aby kontynuowac.
      </div>
    </Modal>
  );
}
