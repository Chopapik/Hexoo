import { RightNavActiveUsers } from "./RightNavActiveUsers";
import Button from "@/features/shared/components/ui/Button";
import { useAppStore } from "@/lib/store/store";
import { PenLine } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";

function RightNavContent() {
  const { t } = useI18n();
  const openCreatePostModal = useAppStore((s) => s.openCreatePostModal);

  return (
    <div className="flex h-full w-full flex-col justify-between">
      <div className="flex h-[403px] w-full flex-col justify-between rounded-3xl bg-surface-chrome-background-default px-[17px] py-[22px] shadow-lg backdrop-blur-sm">
        <RightNavActiveUsers />
        <Button
          text={t("nav.addPost")}
          size="xl"
          rightIcon={<PenLine className="size-4" />}
          className="w-full justify-center font-semibold"
          onClick={openCreatePostModal}
        />
      </div>
      <div className="w-full p-6 text-center font-sans text-xs text-foreground-muted-default">
        <p>© 2025-2026 Hexoo Project.</p>
        <p>Created by CHOPAPIK.</p>
      </div>
    </div>
  );
}

export function RightNavSidebar() {
  return (
    <div className="hidden h-full w-[235px] self-start overflow-hidden rounded-xl shadow-lg md:flex">
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
