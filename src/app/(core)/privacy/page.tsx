"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-3xl  mx-auto pt-3 pb-12 px-4 flex flex-col gap-8">
      <div className="glass-card p-8 rounded-2xl border border-primary-neutral-stroke-default">
        <h1 className="text-3xl font-bold font-Albert_Sans text-text-main mb-2">
          Polityka Prywatności i Cookies
        </h1>
        <p className="text-text-neutral text-sm">
          Ostatnia aktualizacja: {new Date().toLocaleDateString("pl-PL")}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-Albert_Sans text-text-main">
          1. Informacje ogólne
        </h2>
        <p className="text-text-neutral leading-relaxed">
          Szanujemy Twoją prywatność. Aplikacja <strong>Hexoo</strong> zbiera
          tylko te dane, które są absolutnie niezbędne do jej technicznego
          działania, zapewnienia bezpieczeństwa oraz obsługi Twojego konta. Nie
          sprzedajemy Twoich danych nikomu.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-Albert_Sans text-text-main">
          2. Pliki Cookies i Local Storage
        </h2>
        <p className="text-text-neutral leading-relaxed">
          Używamy technologii przechowywania danych w Twojej przeglądarce w
          następujących celach:
        </p>
        <ul className="list-disc list-inside text-text-neutral space-y-2 ml-2">
          <li>
            <span className="text-text-main font-medium">session</span> (Cookie
            HTTP-Only): Służy do utrzymania Twojego zalogowania. Jest to plik
            niezbędny do działania serwisu.
          </li>
          <li>
            <span className="text-text-main font-medium">theme</span> (Local
            Storage): Zapamiętuje Twój wybór trybu jasnego/ciemnego.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-Albert_Sans text-text-main">
          3. Logi Systemowe i Bezpieczeństwo
        </h2>
        <p className="text-text-neutral leading-relaxed">
          W celach bezpieczeństwa (ochrona przed atakami Brute Force oraz DDoS)
          serwer tymczasowo przetwarza Twój adres IP. W przypadku wykrycia
          podejrzanej aktywności, adres IP może zostać zablokowany na czas
          określony (np. 15 minut).
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-Albert_Sans text-text-main">
          4. Google reCAPTCHA
        </h2>
        <p className="text-text-neutral leading-relaxed">
          Ta strona jest chroniona przez reCAPTCHA i obowiązują
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noreferrer"
            className="text-fuchsia-400 hover:underline mx-1"
          >
            Polityka Prywatności
          </a>
          oraz
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noreferrer"
            className="text-fuchsia-400 hover:underline mx-1"
          >
            Warunki Korzystania z Usługi
          </a>
          Google.
        </p>
        <p className="text-text-neutral text-sm mt-2">
          Mechanizm ten służy wyłącznie do walki ze spamem i złośliwym
          oprogramowaniem (botami) w formularzach zmiany hasła i edycji profilu.
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
