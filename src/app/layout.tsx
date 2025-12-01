import type { Metadata } from "next";

import "@/styles/globals.css";
import "@/styles/scrollbar.css";
import "@/styles/glassmorphism.css";
import ReduxProvider from "@/lib/providers/ReduxProvider";
import QueryProvider from "@/lib/providers/QueryProvider";
import RecaptchaProvider from "@/lib/providers/RecaptchaProvider";
import ClientSecurityGuard from "@/features/shared/components/security/ClientSecurityGuard";
import ToastContainer from "@/lib/providers/ToastContainer";
export const metadata: Metadata = {
  title: "Hexoo",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>
        <ClientSecurityGuard>
          <RecaptchaProvider>
            <QueryProvider>
              <ReduxProvider>
                {children}
                <ToastContainer />
              </ReduxProvider>
            </QueryProvider>
          </RecaptchaProvider>
        </ClientSecurityGuard>
      </body>
    </html>
  );
}
