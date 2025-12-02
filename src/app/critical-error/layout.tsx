export const metadata = {
  title: "xs App",
  description: "Empty layout example",
};

export default function CriticalErrorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-page-background flex flex-col">
      {children}
    </div>
  );
}
