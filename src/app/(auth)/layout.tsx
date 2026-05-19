import BackgroundAnimation from "@/features/shared/components/BackgroundAnimation";
import LanguageSwitch from "@/features/shared/components/i18n/LanguageSwitch";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh w-full flex-col">
      <BackgroundAnimation />
      <div className="fixed right-3 top-3 z-20">
        <LanguageSwitch compact />
      </div>
      <div className="relative z-1 flex min-h-dvh flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col overflow-auto px-2 pt-3 sm:flex-1 sm:items-center sm:pt-[5vh]">
          {children}
        </div>
      </div>
    </div>
  );
}
