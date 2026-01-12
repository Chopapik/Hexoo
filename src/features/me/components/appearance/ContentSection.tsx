"use client";

import { useState, useEffect } from "react";
import Button from "@/features/shared/components/ui/Button";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setNsfwVisibility,
  initializeSettings,
} from "@/features/me/store/settingsSlice";
import SettingsSection from "../SettingsSection";

const NsfwToggleIcon = ({ isVisible }: { isVisible: boolean }) => {
  return (
    <div className="relative w-5 h-5 flex items-center justify-center">
      <LuEyeOff
        className={`w-5 h-5 absolute transition-all duration-500 ease-spring-smooth ${
          isVisible
            ? "opacity-0 -rotate-90 scale-0"
            : "opacity-100 rotate-0 scale-100"
        }`}
      />
      <LuEye
        className={`w-5 h-5 absolute transition-all duration-500 ease-spring-smooth ${
          isVisible
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-0"
        }`}
      />
    </div>
  );
};

export default function ContentSection() {
  const [isMounted, setMounted] = useState(false);
  const dispatch = useAppDispatch();
  const showNSFW = useAppSelector((state) => state.settings.showNSFW);

  useEffect(() => {
    dispatch(initializeSettings());
    setMounted(true);
  }, [dispatch]);

  const handleNsfwToggle = () => {
    const newValue = !showNSFW;
    dispatch(setNsfwVisibility(newValue));
    localStorage.setItem("user_settings_nsfw", JSON.stringify(newValue));
  };

  return (
    <SettingsSection title="Treści">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-text-main">Treści wrażliwe</h4>
          <p className="text-sm text-text-neutral">
            Włącz, aby automatycznie odsłaniać posty oznaczone jako NSFW.
          </p>
        </div>
        <Button
          leftIcon={
            isMounted ? (
              <NsfwToggleIcon isVisible={showNSFW} />
            ) : (
              <div className="w-5 h-5" />
            )
          }
          onClick={handleNsfwToggle}
          className="w-fit"
        />
      </div>
    </SettingsSection>
  );
}
