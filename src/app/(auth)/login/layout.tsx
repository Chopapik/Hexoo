import BackgroundAnimation from "@/features/shared/components/BackgroundAnimation";

export const metadata = {
  title: "Hexoo — Logowanie",
  description: "Empty layout example",
};

export default function AuthLayout({
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
