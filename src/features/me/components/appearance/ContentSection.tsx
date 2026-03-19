"use client";

import { useEffect } from "react";
import SwitchButton from "@/features/shared/components/ui/SwitchButton";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setNsfwVisibility,
  setCommentsNsfwVisibility,
  initializeSettings,
} from "@/features/me/store/settingsSlice";
import SettingsSection from "../SettingsSection";

export default function ContentSection() {
  const dispatch = useAppDispatch();
  const showNSFWPosts = useAppSelector((state) => state.settings.showNSFWPosts);
  const showNSFWComments = useAppSelector(
    (state) => state.settings.showNSFWComments,
  );

  useEffect(() => {
    dispatch(initializeSettings());
  }, [dispatch]);

  const handleNsfwPostsChange = (next: boolean) => {
    dispatch(setNsfwVisibility(next));
    localStorage.setItem("user_settings_nsfw_posts", JSON.stringify(next));
    localStorage.setItem("user_settings_nsfw", JSON.stringify(next));
  };

  const handleNsfwCommentsChange = (next: boolean) => {
    dispatch(setCommentsNsfwVisibility(next));
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
