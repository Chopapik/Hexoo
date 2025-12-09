import HexooBackground from "@/features/shared/components/layout/HexooBackground";

export const metadata = {
  title: "xs App",
  description: "Empty layout example",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-page-background flex flex-col">
      <HexooBackground />
      {children}
    </div>
  );
}
