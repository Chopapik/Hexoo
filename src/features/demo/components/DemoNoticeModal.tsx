"use client";

import { useCallback, useEffect, useState } from "react";

import Modal from "@/features/shared/components/layout/Modal";
import Button from "@/features/shared/components/ui/Button";

const DEMO_NOTICE_STORAGE_KEY = "hexoo-demo-notice-seen";

type DemoNoticeModalProps = {
  isDemo: boolean;
};

function hasSeenDemoNotice(): boolean {
  try {
    return window.localStorage.getItem(DEMO_NOTICE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function rememberDemoNotice(): void {
  try {
    window.localStorage.setItem(DEMO_NOTICE_STORAGE_KEY, "true");
  } catch {
    // Storage may be unavailable in private browsing; closing still works.
  }
}

export default function DemoNoticeModal({ isDemo }: DemoNoticeModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isDemo || hasSeenDemoNotice()) return;
    const openTimer = window.setTimeout(() => setIsOpen(true), 0);
    return () => window.clearTimeout(openTimer);
  }, [isDemo]);

  const close = useCallback(() => {
    rememberDemoNotice();
    setIsOpen(false);
  }, []);

  if (!isDemo) return null;

  const footer = (
    <div className="flex w-full justify-end">
      <Button text="I understand" onClick={close} autoFocus />
    </div>
  );

  return (
    <>
      <div className="pointer-events-none fixed bottom-3 right-3 z-40 rounded-full border border-accent-fuchsia-border-default/50 bg-surface-chrome-background-default px-3 py-1 font-sans text-xs font-semibold uppercase tracking-[0.08em] text-foreground-primary-default shadow-[0px_4px_12px_0px_rgba(0,0,0,0.18)] backdrop-blur-lg md:bottom-4 md:right-4">
        Demo
      </div>
      <Modal
        isOpen={isOpen}
        onClose={close}
        title="Public demo version"
        footer={footer}
        className="max-w-[520px]"
      >
        <div className="space-y-4 px-4 py-5 font-sans text-sm leading-6 text-foreground-primary-default sm:px-6 sm:py-6">
          <p>
            This is a public demo version of Hexoo. You can create your own
            account or use the shared demo account:
          </p>
          <div>
            <p>Email: demo@hexoo.eu</p>
            <p>Password: demo1234</p>
          </div>
          <p>
            Demo data is reset automatically. Test accounts, uploaded images,
            posts, comments and reactions created by visitors may be removed
            during the next reset.
          </p>
          <p>Please do not enter private information or real personal data.</p>
        </div>
      </Modal>
    </>
  );
}
