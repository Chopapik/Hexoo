import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hexoo",
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
