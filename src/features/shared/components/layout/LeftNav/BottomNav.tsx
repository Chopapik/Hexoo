import Button from "@/features/shared/components/ui/Button";
import { NavItem } from "./NavItem";
import { useAppStore } from "@/lib/store/store";
import type { SessionData } from "@/features/me/me.type";
import { Plus } from "lucide-react";
import {
  HomeIcon,
  MessagesIcon,
  ProfileIcon,
  SettingsIcon,
} from "@/features/shared/components/icons/NavIcons";
import { useI18n } from "@/i18n/useI18n";

type BottomNavProps = {
  onOpenRight?: () => void;
  user: SessionData;
};

export function BottomNav({ user }: BottomNavProps) {
  const { t } = useI18n();
  const openCreatePostModal = useAppStore((s) => s.openCreatePostModal);

  return (
    <nav className="pointer-events-auto flex w-full max-w-[430px] flex-col items-center rounded-[32px] bg-surface-chrome-background-default p-2 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-sm">
      <div className="flex w-full min-w-[256px] items-center justify-between overflow-hidden">
        <div className="flex shrink-0 flex-row items-start gap-4 overflow-hidden rounded-3xl border border-surface-chrome-border-default bg-surface-chrome-background-default p-1.5">
          <NavItem
            label={t("nav.home")}
            to="/"
            icon={HomeIcon}
            variant="bottom"
          />
          <NavItem
            label={t("nav.profile")}
            to={`/profile/${encodeURIComponent(user.uid)}`}
            icon={ProfileIcon}
            variant="bottom"
          />
          <NavItem
            label={t("nav.messages")}
            to="/messages"
            icon={MessagesIcon}
            variant="bottom"
          />
          <NavItem
            label={t("nav.settings")}
            to="/settings"
            icon={SettingsIcon}
            variant="bottom"
          />
        </div>

        <Button
          size="md"
          iconOnly
          aria-label={t("nav.addPost")}
          icon={
            <span className="relative size-5 shrink-0">
              <Plus
                className="absolute inset-0 size-6 max-w-none"
                strokeWidth={2}
                aria-hidden
              />
            </span>
          }
          className="shrink-0"
          onClick={() => openCreatePostModal()}
        />
      </div>
    </nav>
  );
}
