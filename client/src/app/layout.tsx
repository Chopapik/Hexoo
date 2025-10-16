import type { Metadata } from "next";

import "@/styles/globals.css";
import "@/styles/scrollbar.css";

import { Layout } from "@/components/layout/Layout";

export const metadata: Metadata = {
  title: "Twoja Aplikacja",
  description: "Opis aplikacji",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
