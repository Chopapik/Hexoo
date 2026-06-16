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
      <div className="flex h-[403px] w-full flex-col items-center justify-between overflow-hidden rounded-3xl bg-surface-chrome-background-default px-[17px] py-[22px] shadow-lg backdrop-blur-sm">
        <RightNavActiveUsers />
        <Button
          text={t("nav.addPost")}
          size="xl"
          rightIcon={<PenLine className="size-3.5" strokeWidth={2} />}
          className="h-[52px] min-h-[52px] w-[153px]"
          onClick={openCreatePostModal}
        />
      </div>
      <div className="flex min-h-[86px] w-full flex-col items-center justify-center overflow-hidden whitespace-nowrap text-center font-sans text-xs font-normal leading-tight text-foreground-muted-default">
        <p>© 2025-2026 Hexoo Project.</p>
        <p>Created by CHOPAPIK.</p>
      </div>
    </div>
  );
}

export function RightNavSidebar() {
  return (
    <div className="hidden h-[calc(100vh-76px)] min-h-[720px] w-[235px] self-start overflow-hidden rounded-xl drop-shadow-[0px_4px_6px_rgba(0,0,0,0.25)] md:flex">
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

      {open && (
        <button
          aria-label={t("nav.closeRightSidebar")}
          onClick={onClose}
          className="md:hidden fixed inset-0 bg-modal-overlay-background-default z-40"
        />
      )}
    </>
  );
}
