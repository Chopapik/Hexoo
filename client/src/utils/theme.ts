const STORAGE_KEY = "theme";
export type ThemeName = "dark" | "light";

export const getTheme = (): ThemeName => {
  const attr = document?.documentElement.getAttribute("data-theme");
  return attr === "light" || attr === "dark" ? (attr as ThemeName) : "dark";
};

export const setTheme = (theme: ThemeName) => {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
};

export const toggleTheme = (): ThemeName => {
  const next: ThemeName = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
};

export const initTheme = () => {
  let theme: ThemeName | null = null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") theme = stored as ThemeName;
  } catch {}

  if (!theme) {
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    theme = prefersDark ? "dark" : "light";
  }

  setTheme(theme);
};
