import type { Metadata } from "next";

import "@/styles/globals.css";
import "@/styles/scrollbar.css";
import "@/styles/glassmorphism.css";
import AuthProvider from "@/lib/providers/AuthProvider";
import ReduxProvider from "@/lib/providers/ReduxProvider";
export const metadata: Metadata = {
  title: "Hexoo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>
        <ReduxProvider>
          <AuthProvider>{children}</AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
