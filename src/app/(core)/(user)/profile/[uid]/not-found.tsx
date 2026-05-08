import Link from "next/link";
import Button from "@/features/shared/components/ui/Button";

export default function ProfileNotFound() {
  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full p-8 flex flex-col items-center    animate-in fade-in zoom-in duration-300">
        <h1 className="text-3xl font-serif font-bold text-text-main text-center mb-3">
          Profil nieznaleziony
        </h1>

        <h2 className="text-lg font-sans font-medium text-center mb-6">
          Użytkownik, którego szukasz, nie istnieje.
        </h2>

        <Link href="/">
          <Button
            text="Wróć na Stronę Główną"
            variant="default"
            size="md"
            className="w-full sm:w-auto"
          />
        </Link>
      </div>
    </div>
  );
}
