import Link from "next/link";
import Button from "@/features/shared/components/ui/Button";
import { UserX } from "lucide-react";

export default function ProfileNotFound() {
  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full p-8 flex flex-col items-center    animate-in fade-in zoom-in duration-300">
        <div className="mb-6 p-4 bg-fuchsia-500/10 rounded-full border border-fuchsia-500/30 text-fuchsia-400">
          <UserX size={40} strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl font-Albert_Sans font-bold text-text-main text-center mb-3">
          Profil nieznaleziony
        </h1>

        <h2 className="text-lg font-Albert_Sans font-medium text-fuchsia-400 text-center mb-6">
          Użytkownik, którego szukasz, nie istnieje.
        </h2>

        <p className="text-sm text-text-neutral text-center mb-8 font-Albert_Sans leading-relaxed">
          Upewnij się, że nazwa użytkownika jest wpisana poprawnie, lub wróć na
          stronę główną, aby odkryć inne profile.
        </p>

        <Link href="/">
          <Button
            text="Wróć na Stronę Główną"
            variant="gradient-fuchsia"
            size="md"
            className="w-full sm:w-auto"
          />
        </Link>
      </div>
    </div>
  );
}
