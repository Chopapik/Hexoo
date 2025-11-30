export const metadata = {
  title: "xs App",
  description: "Empty layout example",
};

export default function CriticalErrorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-screen h-screen">{children}</div>;
}
