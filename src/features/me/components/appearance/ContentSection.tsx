"use client";

import { useEffect } from "react";
import SwitchButton from "@/features/shared/components/ui/SwitchButton";
import { useAppStore } from "@/lib/store/store";
import SettingsSection from "../SettingsSection";
import { useI18n } from "@/i18n/useI18n";

export default function ContentSection() {
  const { t } = useI18n();
  const showNSFWPosts = useAppStore((s) => s.settings.showNSFWPosts);
  const showNSFWComments = useAppStore((s) => s.settings.showNSFWComments);
  const initializeSettings = useAppStore((s) => s.initializeSettings);
  const setNsfwVisibility = useAppStore((s) => s.setNsfwVisibility);
  const setCommentsNsfwVisibility = useAppStore(
    (s) => s.setCommentsNsfwVisibility,
  );

  useEffect(() => {
    initializeSettings();
  }, [initializeSettings]);

  const handleNsfwPostsChange = (next: boolean) => {
    setNsfwVisibility(next);
    localStorage.setItem("user_settings_nsfw_posts", JSON.stringify(next));
    localStorage.setItem("user_settings_nsfw", JSON.stringify(next));
  };

  const handleNsfwCommentsChange = (next: boolean) => {
    setCommentsNsfwVisibility(next);
    localStorage.setItem(
      "user_settings_nsfw_comments",
      JSON.stringify(next),
    );
  };

  return (
    <SettingsSection title={t("settings.content.title")}>
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-row items-center justify-between gap-2 md:gap-3">
          <div className="min-w-0 flex-1 text-left">
            <h4
              id="nsfw-posts-label"
              className="font-semibold font-sans text-foreground-primary-default"
            >
              {t("settings.content.nsfwPosts")}
            </h4>
            <p className="font-sans text-xs text-foreground-secondary-default md:text-sm">
              {t("settings.content.nsfwPostsCopy")}
            </p>
          </div>
          <div className="shrink-0">
            <SwitchButton
              checked={showNSFWPosts}
              onChange={handleNsfwPostsChange}
              labelledBy="nsfw-posts-label"
            />
          </div>
        </div>

        <div className="flex flex-row items-center justify-between gap-2 md:gap-3">
          <div className="min-w-0 flex-1 text-left">
            <h4
              id="nsfw-comments-label"
              className="font-semibold font-sans text-foreground-primary-default"
            >
              {t("settings.content.nsfwComments")}
            </h4>
            <p className="font-sans text-xs text-foreground-secondary-default md:text-sm">
              {t("settings.content.nsfwCommentsCopy")}
            </p>
          </div>
          <div className="shrink-0">
            <SwitchButton
              checked={showNSFWComments}
              onChange={handleNsfwCommentsChange}
              labelledBy="nsfw-comments-label"
            />
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
