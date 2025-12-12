const STORAGE_KEY = "theme";
export type ThemeName = "dark" | "light";

export const getTheme = (): ThemeName => {
  if (typeof document === "undefined") return "dark";
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
};

export const setTheme = (theme: ThemeName) => {
  if (typeof document === "undefined") return;

  document.documentElement.setAttribute("data-theme", theme);

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (e) {
    console.error("Nie udało się zapisać motywu:", e);
  }
};

export const toggleTheme = (): ThemeName => {
  const current = getTheme();
  const next = current === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
};
