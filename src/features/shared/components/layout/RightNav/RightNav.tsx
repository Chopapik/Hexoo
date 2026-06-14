import { RightNavActiveUsers } from "./RightNavActiveUsers";
import { useI18n } from "@/i18n/useI18n";

function RightNavContent() {
  return (
    <div className="flex flex-col h-full w-full  justify-between">
      <div className="p-3 w-full h-full flex flex-col gap-4">
        <RightNavActiveUsers />
      </div>
      <div className="text-xs text-foreground-secondary-default/35 font-sans w-full text-center p-6">
        <p>© 2025-2026 Hexoo Project.</p>
        <p>Created by CHOPAPIK.</p>
      </div>
    </div>
  );
}

export function RightNavSidebar() {
  return (
    <div className="hidden md:flex md:sticky md:top-4 self-start bg-surface-card-background-default border-t-2 border-surface-card-border-default rounded-xl overflow-hidden md:w-20 lg:w-[244px] xl:w-72 h-full">
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
        className={`md:hidden fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] bg-surface-card-background-default border-t border-surface-card-border-default rounded-l-xl shadow-xl transform transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <RightNavContent />
      </div>

      {open && (
        <button
          aria-label={t("nav.closeRightSidebar")}
          onClick={onClose}
          className="md:hidden fixed inset-0 bg-black/30 z-40"
        />
      )}
    </>
  );
}
