/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_LANG } from "@/i18n/translations";
import { useAppStore } from "./store";

const LANGUAGE_LOCAL_STORAGE_KEY = "hexoo_language";
const LANGUAGE_OVERRIDE_LOCAL_STORAGE_KEY = "hexoo_language_overridden_by_user";

const setBrowserLocale = (language: string, languages: string[]) => {
  Object.defineProperty(window.navigator, "language", {
    value: language,
    configurable: true,
  });
  Object.defineProperty(window.navigator, "languages", {
    value: languages,
    configurable: true,
  });
};

describe("language settings store", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = "";
    useAppStore.setState((state) => ({
      settings: {
        ...state.settings,
        language: DEFAULT_LANG,
        languageOverriddenByUser: false,
      },
    }));
  });

  it("initializes language from browser when user has no manual override", () => {
    setBrowserLocale("en-US", ["en-US", "pl-PL"]);

    useAppStore.getState().initializeLanguage();

    const settings = useAppStore.getState().settings;
    expect(settings.language).toBe("en");
    expect(settings.languageOverriddenByUser).toBe(false);
    expect(localStorage.getItem(LANGUAGE_LOCAL_STORAGE_KEY)).toBe("en");
    expect(localStorage.getItem(LANGUAGE_OVERRIDE_LOCAL_STORAGE_KEY)).toBeNull();
    expect(document.documentElement.lang).toBe("en");
  });

  it("sets manual override flag when user changes language", () => {
    useAppStore.getState().setLanguage("en");

    const settings = useAppStore.getState().settings;
    expect(settings.language).toBe("en");
    expect(settings.languageOverriddenByUser).toBe(true);
    expect(localStorage.getItem(LANGUAGE_LOCAL_STORAGE_KEY)).toBe("en");
    expect(localStorage.getItem(LANGUAGE_OVERRIDE_LOCAL_STORAGE_KEY)).toBe("1");
    expect(document.documentElement.lang).toBe("en");
  });

  it("keeps user-selected language even if browser locale differs", () => {
    localStorage.setItem(LANGUAGE_LOCAL_STORAGE_KEY, "pl");
    localStorage.setItem(LANGUAGE_OVERRIDE_LOCAL_STORAGE_KEY, "1");
    setBrowserLocale("en-US", ["en-US"]);

    useAppStore.getState().initializeLanguage();

    const settings = useAppStore.getState().settings;
    expect(settings.language).toBe("pl");
    expect(settings.languageOverriddenByUser).toBe(true);
    expect(localStorage.getItem(LANGUAGE_LOCAL_STORAGE_KEY)).toBe("pl");
    expect(document.documentElement.lang).toBe("pl");
  });
});
