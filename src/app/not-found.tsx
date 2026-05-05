import Link from "next/link";
import Button from "@/features/shared/components/ui/Button";

export default function NotFound() {
  return (
    <div className="w-full min-h-[calc(100vh-100px)] flex flex-col items-center justify-center">
      <div className="max-w-md p-10 glass-card rounded-2xl flex h-fit flex-col items-center border border-primary-neutral-stroke-default shadow-2xl">
        <h1 className="text-4xl font-serif font-bold text-text-main text-center mb-4">
          Błąd 404
        </h1>

        <h2 className="text-xl font-sans font-medium text-text-neutral text-center mb-6">
          Zasób nie został znaleziony.
        </h2>

        <Link href="/">
          <Button text="Wróć na Stronę Główną" variant="default" size="md" />
        </Link>
      </div>
    </div>
  );
}
