export const metadata = {
  title: "xs App",
  description: "Empty layout example",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-screen h-screen">{children}</div>;
}
