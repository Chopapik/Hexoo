import type { Metadata } from "next";

import "@/styles/globals.css";
import "@/styles/scrollbar.css";
import "@/styles/glassmorphism.css";
import ReduxProvider from "@/lib/providers/ReduxProvider";
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
    <html lang="pl" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <RecaptchaProvider>
          <QueryProvider>
            <ReduxProvider>
              {children}
              <ToastContainer />
            </ReduxProvider>
          </QueryProvider>
        </RecaptchaProvider>
      </body>
    </html>
  );
}
