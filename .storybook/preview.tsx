import type { Preview } from "@storybook/nextjs-vite";
import MockDate from "mockdate";
import { initialize, mswLoader } from "msw-storybook-addon";

import "../src/styles/globals.css";
import "../src/styles/scrollbar.css";
import "../src/styles/glassmorphism.css";

import LanguageBootstrap from "../src/i18n/LanguageBootstrap";
import QueryProvider from "../src/lib/providers/QueryProvider";
import RecaptchaProvider from "../src/lib/providers/RecaptchaProvider";
import ToastContainer from "../src/lib/providers/ToastContainer";
import { newsreader, robotoMono, rubik } from "../src/styles/fonts";
import { mswHandlers } from "./msw-handlers";

initialize({ onUnhandledRequest: "bypass" });

const preview: Preview = {
  decorators: [
    (Story) => {
      document.documentElement.dataset.theme = "dark";
      document.documentElement.classList.add(
        rubik.variable,
        newsreader.variable,
        robotoMono.variable,
      );

      return (
        <RecaptchaProvider>
          <QueryProvider>
            <LanguageBootstrap />
            <Story />
            <ToastContainer />
          </QueryProvider>
        </RecaptchaProvider>
      );
    },
  ],
  loaders: [mswLoader],
  parameters: {
    msw: {
      handlers: mswHandlers,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
  async beforeEach() {
    localStorage.setItem("theme", "dark");
    localStorage.setItem("hexoo_language", "en");
    localStorage.setItem("hexoo_language_overridden_by_user", "1");
    localStorage.setItem("user_settings_nsfw_posts", "false");
    localStorage.setItem("user_settings_nsfw_comments", "false");
    document.documentElement.dataset.theme = "dark";
    document.documentElement.lang = "en";
    MockDate.set("2024-04-01T12:00:00Z");
  },
};

export default preview;
