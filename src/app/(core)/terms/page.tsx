"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="w-full max-w-3xl mx-auto pt-3 pb-12 px-4 flex flex-col gap-8">
      <div className="glass-card p-8 rounded-2xl border border-primary-neutral-stroke-default">
        <h1 className="text-3xl font-bold font-Albert_Sans text-text-main mb-2">
          Regulamin Serwisu Hexoo
        </h1>
        <p className="text-text-neutral text-sm">
          Wersja 1.0 | Obowiązuje od: {new Date().toLocaleDateString("pl-PL")}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-Albert_Sans text-text-main">
          1. Postanowienia ogólne
        </h2>
        <p className="text-text-neutral leading-relaxed">
          1.1. Niniejszy Regulamin określa zasady korzystania z serwisu
          społecznościowego <strong>Hexoo</strong>.
          <br />
          1.2. Serwis jest projektem inżynierskim o charakterze
          edukacyjno-demonstracyjnym. Nie stanowi on komercyjnej usługi w
          rozumieniu prawa handlowego.
          <br />
          1.3. Rejestracja w serwisie jest dobrowolna i oznacza akceptację
          niniejszego Regulaminu.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-Albert_Sans text-text-main">
          2. Konto i Bezpieczeństwo
        </h2>
        <ul className="list-disc list-inside text-text-neutral space-y-2 ml-2">
          <li>
            Użytkownik zobowiązany jest do podania prawdziwych danych podczas
            rejestracji.
          </li>
          <li>
            Serwis wykorzystuje zaawansowane mechanizmy ochrony (m.in.{" "}
            <strong>Audio CAPTCHA</strong>, <strong>Google reCAPTCHA v3</strong>{" "}
            oraz limity logowań) w celu ochrony przed botami i nieautoryzowanym
            dostępem.
          </li>
          <li>
            W przypadku wykrycia podejrzanej aktywności (np. ataki Brute Force),
            adres IP użytkownika może zostać tymczasowo zablokowany.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-Albert_Sans text-text-main">
          3. Publikacja Treści i Moderacja AI
        </h2>
        <div className="p-4 rounded-xl bg-fuchsia-900/10 border border-fuchsia-500/20">
          <p className="text-text-main text-sm font-medium mb-2">
            🤖 System Automatycznej Moderacji
          </p>
          <p className="text-text-neutral text-sm">
            Wszystkie treści publikowane w serwisie (tekst i obrazy) są
            automatycznie analizowane przez algorytmy Sztucznej Inteligencji
            (modele oparte na architekturze Transformer).
          </p>
        </div>
        <p className="text-text-neutral leading-relaxed">
          3.1. Zabrania się publikowania treści:
        </p>
        <ul className="list-disc list-inside text-text-neutral space-y-1 ml-4">
          <li>Nawołujących do nienawiści, przemocy lub dyskryminacji.</li>
          <li>O charakterze pornograficznym lub drastycznym.</li>
          <li>Stanowiących spam lub reklamę.</li>
        </ul>
        <p className="text-text-neutral leading-relaxed mt-2">
          3.2. <strong>System "Flag & Review":</strong> Treści oznaczone przez
          AI jako podejrzane nie zostaną opublikowane natychmiast, lecz trafią
          do kolejki moderacyjnej (status <em>Pending</em>) w celu weryfikacji
          przez człowieka.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-Albert_Sans text-text-main">
          4. Społecznościowa Kontrola Treści
        </h2>
        <p className="text-text-neutral leading-relaxed">
          4.1. Użytkownicy mają prawo zgłaszać treści naruszające regulamin.
          <br />
          4.2. System wykorzystuje mechanizm demokratycznej weryfikacji –
          wielokrotne zgłoszenia tego samego materiału przez różnych
          użytkowników mogą skutkować jego automatycznym ukryciem do czasu
          weryfikacji przez Administratora.
        </p>
      </section>

      {/* Sekcja 5: Odpowiedzialność */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-Albert_Sans text-text-main">
          5. Wyłączenie Odpowiedzialności
        </h2>
        <p className="text-text-neutral leading-relaxed">
          5.1. Aplikacja jest udostępniana w modelu "AS-IS" (tak jak jest).
          Administrator nie gwarantuje ciągłości działania serwisu ani
          bezpieczeństwa danych w przypadku awarii krytycznych (np. po stronie
          dostawcy chmury Firebase).
          <br />
          5.2. Ponieważ jest to projekt demonstracyjny, Administrator zastrzega
          sobie prawo do usunięcia całej bazy danych lub kont użytkowników bez
          uprzedzenia.
        </p>
      </section>

      <div className="pt-8 mt-8 border-t border-white/10 flex justify-center">
        <Link
          href="/"
          className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors font-medium"
        >
          &larr; Wróć do strony głównej
        </Link>
      </div>
    </div>
  );
}
