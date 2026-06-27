import type { Metadata } from "next";

import { rubik, newsreader, robotoMono } from "@/styles/fonts";

import "@/styles/globals.css";
import "@/styles/scrollbar.css";
import "@/styles/glassmorphism.css";
import "@/styles/recaptcha.css";
import QueryProvider from "@/lib/providers/QueryProvider";
import RecaptchaProvider from "@/lib/providers/RecaptchaProvider";
import ToastContainer from "@/lib/providers/ToastContainer";
import SettingsInitializer from "@/lib/providers/SettingsInitializer";
import ThemeScript from "@/features/shared/components/ThemeScript";
import LanguageBootstrap from "@/i18n/LanguageBootstrap";
import DemoNoticeModal from "@/features/demo/components/DemoNoticeModal";

export const metadata: Metadata = {
  title: "Hexoo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDemo = process.env.NEXT_PUBLIC_IS_DEMO === "true";

  return (
    <html
      lang="pl"
      suppressHydrationWarning
      className={`${rubik.variable} ${newsreader.variable} ${robotoMono.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="m-0 bg-page-background-default p-0 font-sans text-foreground-primary-default antialiased [&_button]:font-inherit [&_input]:font-inherit [&_option]:font-inherit [&_select]:font-inherit [&_textarea]:font-inherit">
        <RecaptchaProvider>
          <QueryProvider>
            <LanguageBootstrap />
            <SettingsInitializer />
            {children}
            <DemoNoticeModal isDemo={isDemo} />
            <ToastContainer />
          </QueryProvider>
        </RecaptchaProvider>
      </body>
    </html>
  );
}
