import type { Metadata } from "next";

import "@/styles/globals.css";
import "@/styles/scrollbar.css";
import "@/styles/glassmorphism.css";
import ReduxProvider from "@/lib/providers/ReduxProvider";
import QueryProvider from "@/lib/providers/QueryProvider";
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
        <QueryProvider>
          <ReduxProvider>{children}</ReduxProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
