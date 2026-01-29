import Link from "next/link";
import Button from "@/features/shared/components/ui/Button";

export default function NotFound() {
  return (
    <div className="w-full min-h-[calc(100vh-100px)] flex flex-col items-center justify-center">
      <div className="max-w-md p-10 glass-card rounded-2xl flex h-fit flex-col items-center border border-primary-neutral-stroke-default shadow-2xl">
        <div className="mb-6 p-4 bg-fuchsia-500/10 rounded-full border border-fuchsia-500/30 text-fuchsia-400">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </div>

        <h1 className="text-4xl font-Albert_Sans font-bold text-text-main text-center mb-4">
          Błąd 404
        </h1>

        <h2 className="text-xl font-Albert_Sans font-medium text-fuchsia-400 text-center mb-6">
          Zasób nie został znaleziony.
        </h2>

        <p className="text-sm text-text-neutral text-center mb-8 font-Albert_Sans leading-relaxed">
          Strona, której szukasz, nie istnieje lub została usunięta.
          <br />
          Sprawdź poprawność adresu URL.
        </p>

        <Link href="/">
          <Button
            text="Wróć na Stronę Główną"
            variant="default"
            size="md"
          />
        </Link>
      </div>
    </div>
  );
}
