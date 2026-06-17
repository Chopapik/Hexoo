const STORAGE_KEY = "theme";
const THEME_CHANGE_EVENT = "hexoo:themechange";

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
    console.error("Failed to save theme:", e);
  }

  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }));
};

export const toggleTheme = (): ThemeName => {
  const current = getTheme();
  const next = current === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
};

export const subscribeToTheme = (onStoreChange: () => void) => {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
};
