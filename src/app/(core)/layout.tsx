import type { Metadata } from "next";

import { Layout } from "@/features/shared/components/layout/Layout";

export const metadata: Metadata = {
  title: "Hexoo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}
