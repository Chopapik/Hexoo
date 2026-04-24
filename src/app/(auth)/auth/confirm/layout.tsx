import HexooBackground from "@/features/shared/components/layout/HexooBackground";

export const metadata = {
  title: "Hexoo — Google",
  description: "OAuth flow",
};

export default function OAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full min-h-screen flex flex-col">
      <HexooBackground />
      {children}
    </div>
  );
}
