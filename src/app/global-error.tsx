"use client";

import Button from "@/features/shared/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pl">
      <body className="bg-page-background text-text-main flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full glass-card p-8 text-center rounded-2xl shadow-2xl border border-primary-neutral-stroke-default">
          <div className="mb-6">
            <div className="mx-auto size-14 mb-4 p-3 bg-red-500/10 rounded-full border border-red-500/30 text-red-400 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <h2 className="text-3xl font-bold font-Albert_Sans text-red-500 mb-2">
              Krytyczny Błąd
            </h2>
            <p className="text-text-neutral">
              Nie udało się załadować aplikacji. Prawdopodobnie wystąpił problem
              z serwerem.
            </p>
          </div>

          <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-sm font-mono text-left mb-6 overflow-auto">
            <p className="text-red-400">Error: {error.message}</p>
            {error.digest && (
              <p className="text-text-neutral/50 text-xs mt-1">
                Digest: {error.digest}
              </p>
            )}
          </div>

          <Button
            onClick={() => reset()}
            text="Spróbuj ponownie"
            size="lg"
            variant="gradient-fuchsia"
            className="w-full"
          />

          <button
            onClick={() => window.location.reload()}
            className="w-full mt-3 py-2 px-4 text-text-neutral hover:text-text-main text-sm transition-colors font-medium"
          >
            Odśwież całą stronę
          </button>
        </div>
      </body>
    </html>
  );
}
