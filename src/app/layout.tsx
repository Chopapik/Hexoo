import type { Metadata } from "next";

import "@/styles/globals.css";
import "@/styles/scrollbar.css";
import "@/styles/glassmorphism.css";

export const metadata: Metadata = {
  title: "Hexoo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" nighteye="disabled">
      <body>{children}</body>
    </html>
  );
}
