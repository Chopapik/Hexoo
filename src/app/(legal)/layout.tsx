import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hexoo",
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto p-4 md:p-16">{children}</div>
  );
}
