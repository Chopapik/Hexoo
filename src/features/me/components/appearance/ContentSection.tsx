"use client";

import { useEffect } from "react";
import SwitchButton from "@/features/shared/components/ui/SwitchButton";
import { useAppStore } from "@/lib/store/store";
import SettingsSection from "../SettingsSection";

export default function ContentSection() {
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
    <SettingsSection title="Treści">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h4 id="nsfw-posts-label" className="font-semibold text-text-main">
              Pokaż treść NSFW w postach
            </h4>
            <p className="text-sm text-text-neutral">
              Włącz, aby automatycznie pokazywać posty oznaczone jako NSFW.
            </p>
          </div>
          <SwitchButton
            checked={showNSFWPosts}
            onChange={handleNsfwPostsChange}
            labelledBy="nsfw-posts-label"
          />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h4
              id="nsfw-comments-label"
              className="font-semibold text-text-main"
            >
              Pokaż treść NSFW w komentarzach
            </h4>
            <p className="text-sm text-text-neutral">
              Włącz, aby pokazywać komentarze oznaczone jako NSFW.
            </p>
          </div>
          <SwitchButton
            checked={showNSFWComments}
            onChange={handleNsfwCommentsChange}
            labelledBy="nsfw-comments-label"
          />
        </div>
      </div>
    </SettingsSection>
  );
}
