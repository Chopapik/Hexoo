import type { Metadata } from "next";

import { rubik, newsreader, robotoMono } from "@/styles/fonts";

import "@/styles/globals.css";
import "@/styles/scrollbar.css";
import "@/styles/glassmorphism.css";
import QueryProvider from "@/lib/providers/QueryProvider";
import RecaptchaProvider from "@/lib/providers/RecaptchaProvider";
import ToastContainer from "@/lib/providers/ToastContainer";
import ThemeScript from "@/features/shared/components/ThemeScript";

export const metadata: Metadata = {
  title: "Hexoo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pl"
      suppressHydrationWarning
      className={`${rubik.variable} ${newsreader.variable} ${robotoMono.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased">
        <RecaptchaProvider>
          <QueryProvider>
            {children}
            <ToastContainer />
          </QueryProvider>
        </RecaptchaProvider>
      </body>
    </html>
  );
}
