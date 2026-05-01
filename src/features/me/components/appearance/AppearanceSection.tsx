"use client";

import { useState, useEffect } from "react";
import Button from "@/features/shared/components/ui/Button";
import { toggleTheme } from "@/features/shared/utils/theme";
import { LuSun, LuMoon } from "react-icons/lu";
import SettingsSection from "../SettingsSection";

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

export default function AppearanceSection() {
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setMounted] = useState(false);

  useEffect(() => {
    const isDarkMode =
      document.documentElement.classList.contains("dark") ||
      localStorage.getItem("theme") === "dark";
    setIsDark(isDarkMode);
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    toggleTheme();
    setIsDark((prev) => !prev);
  };

  return (
    <SettingsSection title="Wygląd">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold font-sans text-text-main">
            Motyw aplikacji
          </h4>
          <p className="text-sm font-sans text-text-neutral">
            Dostosuj wygląd interfejsu do swoich preferencji (Jasny / Ciemny).
          </p>
        </div>
        <Button
          leftIcon={
            isMounted ? (
              <ThemeToggleIcon isDark={isDark} />
            ) : (
              <div className="w-5 h-5" />
            )
          }
          onClick={handleThemeToggle}
          className="w-fit"
        />
      </div>
    </SettingsSection>
  );
}
