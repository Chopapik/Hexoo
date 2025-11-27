import type { Metadata } from "next";

import "@/styles/globals.css";
import "@/styles/scrollbar.css";
import "@/styles/glassmorphism.css";
import ReduxProvider from "@/lib/providers/ReduxProvider";
import QueryProvider from "@/lib/providers/QueryProvider";
import RecaptchaProvider from "@/lib/providers/RecaptchaProvider";
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
        <RecaptchaProvider>
          <QueryProvider>
            <ReduxProvider>{children}</ReduxProvider>
          </QueryProvider>
        </RecaptchaProvider>

        <footer className="w-full py-6 text-center text-xs text-text-neutral opacity-70">
          Ta strona jest chroniona przez reCAPTCHA, a obowiązują zasady
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Polityki prywatności
          </a>
          oraz
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Warunki korzystania z usług Google
          </a>
          .
        </footer>
      </body>
    </html>
  );
}
