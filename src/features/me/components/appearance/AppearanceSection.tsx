"use client";

import { useSyncExternalStore } from "react";
import Button from "@/features/shared/components/ui/Button";
import {
  getTheme,
  subscribeToTheme,
  toggleTheme,
  type ThemeName,
} from "@/features/shared/utils/theme";
import { LuSun, LuMoon } from "react-icons/lu";
import SettingsSection from "../SettingsSection";
import { useI18n } from "@/i18n/useI18n";

const ThemeToggleIcon = ({ isDark }: { isDark: boolean }) => {
  return (
    <div className="relative w-5 h-5 flex items-center justify-center">
      <LuSun
        className={`w-5 h-5 absolute transition-all duration-500 ease-spring-smooth ${
          isDark
            ? "opacity-0 -rotate-90 scale-0"
            : "opacity-100 rotate-0 scale-100"
        }`}
      />
      <LuMoon
        className={`w-5 h-5 absolute transition-all duration-500 ease-spring-smooth ${
          isDark
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-0"
        }`}
      />
    </div>
  );
};

const getServerThemeSnapshot = (): ThemeName | null => null;

export default function AppearanceSection() {
  const { t } = useI18n();
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getTheme,
    getServerThemeSnapshot,
  );
  const isDark = theme === "dark";

  const handleThemeToggle = () => {
    toggleTheme();
  };

  return (
    <SettingsSection title={t("settings.appearance.title")}>
      <div className="flex flex-row items-center justify-between gap-3">
        <div className="min-w-0 flex-1 text-left">
          <h4 className="font-semibold font-sans text-foreground-primary-default">
            {t("settings.appearance.theme")}
          </h4>
          <p className="text-sm font-sans text-foreground-secondary-default">
            {t("settings.appearance.copy")}
          </p>
        </div>
        <div className="shrink-0">
          <Button
            leftIcon={
              theme ? (
                <ThemeToggleIcon isDark={isDark} />
              ) : (
                <div className="w-5 h-5" />
              )
            }
            onClick={handleThemeToggle}
            className="w-fit"
          />
        </div>
      </div>
    </SettingsSection>
  );
}
