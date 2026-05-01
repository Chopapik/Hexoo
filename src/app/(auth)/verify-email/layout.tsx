import BackgroundAnimation from "@/features/shared/components/BackgroundAnimation";

export const metadata = {
  title: "Hexoo — Weryfikacja email",
  description: "OAuth flow",
};

export default function OAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full min-h-screen flex flex-col">
      <BackgroundAnimation />
      {children}
    </div>
  );
}
