import { RightNavActiveUsers } from "./RightNavActiveUsers";
import Button from "@/features/shared/components/ui/Button";
import { useAppStore } from "@/lib/store/store";
import { PenLine } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";

function RightNavContent() {
  const { t } = useI18n();
  const openCreatePostModal = useAppStore((s) => s.openCreatePostModal);

  return (
    <div className="flex h-full min-h-[720px] w-full flex-col items-center justify-between pb-4">
      <div className="flex h-[403px] w-full flex-col items-center justify-between overflow-hidden rounded-[24px] bg-surface-chrome-background-default px-[17px] py-[22px] shadow-lg backdrop-blur-sm">
        <RightNavActiveUsers />

        <Button
          text={t("nav.addPost")}
          size="xl"
          rightIcon={<PenLine className="size-3.5" strokeWidth={2} />}
          className="h-[52px] min-h-[52px] w-full"
          onClick={openCreatePostModal}
        />
      </div>

      <footer className="flex min-h-[86px] w-full flex-col items-center justify-center overflow-hidden whitespace-nowrap text-center font-sans text-xs font-normal leading-tight text-foreground-muted-default">
        <p>© 2025-2026 Hexoo Project.</p>
        <p>Created by CHOPAPIK.</p>
      </footer>
    </div>
  );
}

export function RightNavSidebar() {
  return (
    <div className="flex h-full min-h-[720px] w-[235px] self-start overflow-hidden rounded-xl drop-shadow-[0px_4px_6px_rgba(0,0,0,0.25)]">
      <RightNavContent />
    </div>
  );
}

type RightNavOverlayProps = {
  open?: boolean;
  onClose?: () => void;
};

export function RightNavOverlay({
  open = false,
  onClose,
}: RightNavOverlayProps) {
  const { t } = useI18n();

  return (
    <>
      <div
        className={`fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] transform rounded-l-xl bg-page-background-default p-4 shadow-xl transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <RightNavContent />
      </div>

      {open ? (
        <button
          aria-label={t("nav.closeRightSidebar")}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-modal-overlay-background-default md:hidden"
        />
      ) : null}
    </>
  );
}
