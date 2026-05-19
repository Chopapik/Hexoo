"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import BackgroundAnimation from "@/features/shared/components/BackgroundAnimation";
import Button from "@/features/shared/components/ui/Button";
import CreatePostButton from "@/features/posts/components/CreatePostButton";
import { useAppStore } from "@/lib/store/store";
import {
  HexHomeIcon,
  HexExploreIcon,
  HexCreateIcon,
  HexActivityIcon,
  HexProfileIcon,
  HexAdminIcon,
} from "@/features/shared/components/icons/HexNavIcons";
import { useI18n, type TranslationKey } from "@/i18n/useI18n";

export default function AboutPage() {
  const router = useRouter();
  const openCreatePostModal = useAppStore((s) => s.openCreatePostModal);

  const goCreatePost = () => {
    openCreatePostModal();
    router.push("/");
  };

  return (
    <main
      data-theme="dark"
      className="relative min-h-screen overflow-x-clip text-white font-sans selection:bg-fuchsia-500/40 selection:text-white"
    >
      <BackgroundAnimation />
      <DitherOverlay />
      <Scanlines />
      <Hero
        onGoFeed={() => router.push("/")}
        onRegister={() => router.push("/register")}
        onCreatePost={goCreatePost}
      />
      <WhatIsThis />
      <Honeycomb />
      <NoYesSection />
      <Outro
        onGoFeed={() => router.push("/")}
        onLogin={() => router.push("/login")}
      />
      <MiniFooter />
    </main>
  );
}

function DitherOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.08] mix-blend-screen"
      style={{
        backgroundImage:
          "radial-gradient(rgba(192, 38, 211, 0.8) 1px, transparent 1px)",
        backgroundSize: "4px 4px",
      }}
    />
  );
}

function Scanlines() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.04]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 3px)",
      }}
    />
  );
}

function Hero({
  onGoFeed,
  onRegister,
  onCreatePost,
}: {
  onGoFeed: () => void;
  onRegister: () => void;
  onCreatePost: () => void;
}) {
  const { t } = useI18n();

  return (
    <section className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-5 pb-10 pt-14 sm:px-8 sm:pt-20">
      <div className="relative">
        <HeroLogo />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="relative z-10 mt-10 flex flex-col items-center text-center"
      >
        <h1 className="mt-4 font-serif text-[58px] leading-[0.95] tracking-[-0.03em] text-white sm:text-[88px] md:text-[112px]">
          {t("about.hero.titleStart")}{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-fuchsia-300 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
              {t("about.hero.titleAccent")}
            </span>
            <span className="absolute -inset-x-3 -bottom-1 -z-10 h-3 rounded-full bg-fuchsia-500/30 blur-2xl" />
          </span>
        </h1>

        <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-white/60 sm:text-base">
          {t("about.hero.copy")}
          <br />
          <span className="text-white/35">
            {t("about.hero.note")}
          </span>
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row"></div>

        <div className="mt-10 w-full max-w-3xl">
          <CreatePostButton
            onClick={onCreatePost}
            text={t("about.hero.cta")}
            showIcon={false}
            className="h-auto min-h-[4.25rem] py-4 sm:h-auto sm:min-h-[5.75rem] sm:py-6 rounded-2xl sm:rounded-3xl"
            textClassName="text-lg leading-snug sm:text-2xl md:text-3xl"
          />
        </div>
      </motion.div>
    </section>
  );
}

function HeroLogo() {
  return (
    <motion.div
      className="relative flex w-full max-w-5xl flex-col items-center justify-center px-2 py-2"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 1,
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="flex items-center justify-center">
        <img
          src="/logo-animated.svg"
          alt="Hexoo"
          width={920}
          height={300}
          className="h-auto w-[min(100%,560px)] max-w-[min(100%,92vw)] object-contain drop-shadow-[0_0_36px_rgba(192,38,211,0.5)] sm:w-[min(100%,680px)]"
          decoding="async"
        />
      </div>

      <div
        className="pointer-events-none absolute -inset-x-8 -inset-y-16 -z-10 rounded-full bg-fuchsia-500/15 blur-3xl sm:-inset-x-16 sm:-inset-y-20"
        aria-hidden
      />
    </motion.div>
  );
}

function BigBrandHex() {
  return (
    <svg
      viewBox="0 0 84 68"
      className="h-[150px] w-auto drop-shadow-[0_0_30px_rgba(192,38,211,0.55)] sm:h-[180px]"
      aria-hidden
    >
      <defs>
        <linearGradient id="brand-outer" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C026D3" />
          <stop offset="1" stopColor="#A21CAF" />
        </linearGradient>
        <linearGradient id="brand-inner" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#67E8F9" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <path
        d="M74.69 29.5c1.43 2.48 1.43 5.53 0 8L60.06 62.84c-1.43 2.48-4.07 4-6.93 4H23.87c-2.86 0-5.5-1.52-6.93-4L2.31 37.5c-1.43-2.48-1.43-5.53 0-8L16.94 4.16c1.43-2.48 4.07-4 6.93-4h29.26c2.86 0 5.5 1.52 6.93 4L74.69 29.5Z"
        fill="url(#brand-outer)"
      />
      <path
        d="M82.69 28.5c1.43 2.48 1.43 5.53 0 8L73.06 53.18c-1.43 2.48-4.07 4-6.93 4H46.87c-2.86 0-5.5-1.52-6.93-4L30.31 36.5c-1.43-2.48-1.43-5.53 0-8L39.94 11.82c1.43-2.48 4.07-4 6.93-4h19.26c2.86 0 5.5 1.52 6.93 4L82.69 28.5Z"
        fill="url(#brand-inner)"
      />
    </svg>
  );
}

function WhatIsThis() {
  const { t } = useI18n();

  return (
    <section className="relative z-10 mx-auto max-w-5xl px-5 pb-20 pt-10 sm:px-8 sm:pb-28">
      <div className="mb-8 font-sans text-[11px] uppercase tracking-[0.3em] text-fuchsia-300/70">
        {t("about.what.eyebrow")}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <NoteCard delay={0}>
          <span className="text-white/85">
            {t("about.what.card1Strong")}
          </span>{" "}
          {t("about.what.card1")}
        </NoteCard>

        <NoteCard delay={0.08}>
          {t("about.what.card2")}{" "}
          <span className="text-fuchsia-300">{t("about.what.shitposts")}</span>,{" "}
          {t("about.what.card2End")}
        </NoteCard>

        <NoteCard delay={0.16}>
          {t("about.what.card3")}{" "}
          <span className="text-cyan-300">next.js</span> i{" "}
          <span className="text-cyan-300">supabase</span>{" "}
          {t("about.what.card3End")}
        </NoteCard>
      </div>
    </section>
  );
}

function NoteCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay }}
      className="glass-card relative overflow-hidden rounded-2xl p-5"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />
      <div className="relative font-serif text-[17px] leading-[1.55] text-white/70">
        {children}
      </div>
      <div className="relative mt-4 flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.2em] text-white/30">
        <span className="h-px flex-1 bg-white/10" />▌
      </div>
    </motion.div>
  );
}

const FEATURES = [
  {
    Icon: HexCreateIcon,
    labelKey: "about.feature.posts",
    noteKey: "about.feature.postsNote",
  },
  {
    Icon: HexActivityIcon,
    labelKey: "about.feature.comments",
    noteKey: "about.feature.commentsNote",
  },
  {
    Icon: HexHomeIcon,
    labelKey: "about.feature.likes",
    noteKey: "about.feature.likesNote",
  },
  {
    Icon: HexProfileIcon,
    labelKey: "about.feature.profiles",
    noteKey: "about.feature.profilesNote",
  },
  {
    Icon: HexAdminIcon,
    labelKey: "about.feature.moderation",
    noteKey: "about.feature.moderationNote",
  },
  {
    Icon: HexExploreIcon,
    labelKey: "about.feature.feed",
    noteKey: "about.feature.feedNote",
  },
] as const;

function Honeycomb() {
  const { t } = useI18n();

  return (
    <section className="relative z-10 mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="mb-12 flex flex-col items-center text-center">
        <div className="font-sans text-[11px] uppercase tracking-[0.3em] text-fuchsia-300/70">
          {t("about.features.eyebrow")}
        </div>
        <h2 className="mt-3 font-serif text-4xl tracking-[-0.02em] sm:text-5xl">
          {t("about.features.title")}{" "}
          <span className="text-white/40">{t("about.features.titleMuted")}</span>
        </h2>
      </div>

      <HoneycombRosette />

      <div className="mx-auto mt-6 max-w-md text-center font-sans text-[10px] uppercase tracking-[0.25em] text-white/30">
        {t("about.features.note")}
      </div>
    </section>
  );
}

function HoneycombRosette() {
  return (
    <>
      <div className="relative isolate mx-auto hidden h-[600px] w-[600px] md:block">
        <svg
          className="pointer-events-none absolute inset-0 z-[1]"
          viewBox="0 0 600 600"
          aria-hidden
        >
          {[-90, -30, 30, 90, 150, 210].map((deg, i) => {
            const a = (deg * Math.PI) / 180;
            const cx = 300;
            const cy = 300;
            const inner = 102;
            const outer = 208;
            const x = cx + Math.cos(a) * inner;
            const y = cy + Math.sin(a) * inner;
            const x2 = cx + Math.cos(a) * outer;
            const y2 = cy + Math.sin(a) * outer;
            return (
              <line
                key={i}
                x1={x}
                y1={y}
                x2={x2}
                y2={y2}
                stroke="rgba(192,38,211,0.3)"
                strokeWidth={1}
                strokeDasharray="2 4"
              />
            );
          })}
        </svg>

        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2">
          <CenterHexGlow />
        </div>

        {FEATURES.map((f, i) => {
          const angles = [-90, -30, 30, 90, 150, 210];
          const a = (angles[i] * Math.PI) / 180;
          const R = 210;
          const x = Math.cos(a) * R;
          const y = Math.sin(a) * R;
          return (
            <div
              key={f.labelKey}
              className="absolute left-1/2 top-1/2 z-[10]"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.08 * i }}
              >
                <FeatureHex {...f} />
              </motion.div>
            </div>
          );
        })}

        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[20] -translate-x-1/2 -translate-y-1/2">
          <BigBrandHex />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:hidden">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.labelKey}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.04 }}
          >
            <FeatureHex {...f} small />
          </motion.div>
        ))}
      </div>
    </>
  );
}

function CenterHexGlow() {
  return (
    <div className="relative grid size-[220px] place-items-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
        aria-hidden
      >
        <div
          className="absolute inset-[-20%] rounded-full"
          style={{
            backgroundImage:
              "conic-gradient(from 0deg, rgba(192,38,211,0.45), transparent 28%, rgba(103,232,249,0.3) 58%, transparent 82%, rgba(192,38,211,0.45))",
            filter: "blur(28px)",
          }}
        />
      </motion.div>
    </div>
  );
}

function FeatureHex({
  Icon,
  labelKey,
  noteKey,
  small,
}: {
  Icon: (typeof FEATURES)[number]["Icon"];
  labelKey: TranslationKey;
  noteKey: TranslationKey;
  small?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div
      className={[
        "group relative grid place-items-center text-center",
        small ? "size-[150px]" : "size-[160px]",
      ].join(" ")}
      style={{
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/15 via-black/60 to-cyan-400/10 transition-all duration-300 group-hover:from-fuchsia-500/25 group-hover:to-cyan-400/20" />
      <div
        className="absolute inset-[1.5px] bg-black/85 backdrop-blur-sm"
        style={{
          clipPath:
            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          clipPath:
            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      <div className="relative flex flex-col items-center px-3 pt-1">
        <Icon className="size-10 text-fuchsia-200/90 transition-transform duration-300 group-hover:scale-110" />
        <div className="mt-1 font-serif text-[15px] tracking-tight text-white">
          {t(labelKey)}
        </div>
        <div
          className="mt-0.5 px-1 font-sans text-[9.5px] leading-tight text-white/50"
          dangerouslySetInnerHTML={{ __html: t(noteKey) }}
        />
      </div>
    </div>
  );
}

function NoYesSection() {
  const { t } = useI18n();
  const noItems = [
    t("about.no.algorithm"),
    t("about.no.ads"),
    t("about.no.tracking"),
    t("about.no.reels"),
    t("about.no.darkPatterns"),
    t("about.no.infiniteScroll"),
  ];
  const yesItems = [
    t("about.yes.chrono"),
    t("about.yes.likes"),
    t("about.yes.comments"),
    t("about.yes.profiles"),
    t("about.yes.moderation"),
    t("about.yes.feedEnd"),
  ];

  return (
    <section className="relative z-10 mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-24">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Column title={t("about.no.title")} tone="no" items={noItems} />
        <Column title={t("about.yes.title")} tone="yes" items={yesItems} />
      </div>
    </section>
  );
}

function Column({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "no" | "yes";
  items: string[];
}) {
  const tint = tone === "yes" ? "text-fuchsia-300" : "text-white/40";
  const symbol = tone === "yes" ? "+" : "×";
  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />
      <div className="relative">
        <div className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/40">
          {title}
        </div>
        <ul className="mt-5 space-y-2.5 font-sans text-[13px] leading-relaxed">
          {items.map((it, i) => (
            <motion.li
              key={it}
              initial={{ opacity: 0, x: tone === "no" ? -10 : 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className={[
                "flex items-center gap-3",
                tone === "no"
                  ? "text-white/30 line-through decoration-white/15"
                  : "text-white/85",
              ].join(" ")}
            >
              <span
                className={`inline-flex size-5 shrink-0 items-center justify-center text-[14px] ${tint}`}
              >
                {symbol}
              </span>
              {it}
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Outro({
  onGoFeed,
  onLogin,
}: {
  onGoFeed: () => void;
  onLogin: () => void;
}) {
  const { t } = useI18n();

  return (
    <section className="relative z-10 mx-auto max-w-5xl px-5 pb-20 sm:px-8">
      <div className="glass-card relative overflow-hidden rounded-3xl p-10 sm:p-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(192,38,211,0.7) 1px, transparent 1px)",
            backgroundSize: "5px 5px",
          }}
        />

        <div className="relative flex flex-col items-center text-center">
          {/* eslint-disable react/no-unescaped-entities */}
          <pre
            aria-hidden
            className="hidden font-mono text-[10px]  text-fuchsia-300/70 sm:block md:text-[13px]"
          >
            {` 
 __    __  ________  __    __   ______    ______  
|  \\  |  \\|        \\|  \\  |  \\ /      \\  /      \\ 
| $$  | $$| $$$$$$$$| $$  | $$|  $$$$$$\\|  $$$$$$\\
| $$__| $$| $$__     \\$$\\/  $$| $$  | $$| $$  | $$
| $$    $$| $$  \\     >$$  $$ | $$  | $$| $$  | $$
| $$$$$$$$| $$$$$    /  $$$$\\ | $$  | $$| $$  | $$
| $$  | $$| $$_____ |  $$ \\$$\\| $$__/ $$| $$__/ $$
| $$  | $$| $$     \\| $$  | $$ \\$$    $$ \\$$    $$
 \\$$   \\$$ \\$$$$$$$$ \\$$   \\$$  \\$$$$$$   \\$$$$$$ 
                                                  `}
          </pre>

          <h3 className="mt-5 font-serif text-5xl tracking-[-0.03em] sm:text-7xl">
            {t("about.outro.title")}
          </h3>

          <p className="mt-5 max-w-md font-sans text-[12px] uppercase tracking-[0.18em] text-white/40">
            {t("about.outro.copy")}
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Button
              text={t("about.outro.feed")}
              size="lg"
              variant="default"
              onClick={onGoFeed}
              rightIcon={<span aria-hidden>→</span>}
              className="px-5 text-[12px] font-semibold uppercase tracking-[0.2em] shadow-[0_10px_40px_-12px_rgba(192,38,211,0.9)]"
            />
            <Button
              text={t("about.outro.register")}
              size="lg"
              variant="secondary"
              onClick={onLogin}
              className="px-5 text-[12px] font-semibold tracking-[0.2em] text-white/90"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniFooter() {
  return (
    <footer className="relative z-10 border-t border-white/[0.06] bg-black/40 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-5 font-sans text-[10px] uppercase tracking-[0.18em] text-white/30 sm:flex-row sm:px-8">
        <span>hexoo project chopapik © 2025-{new Date().getFullYear()}</span>
        <span className="flex flex-wrap items-center gap-4">
          <Link href="/" className="hover:text-fuchsia-300">
            feed
          </Link>
          <Link href="/login" className="hover:text-fuchsia-300">
            login
          </Link>
          <Link href="/register" className="hover:text-fuchsia-300">
            register
          </Link>
        </span>
      </div>
    </footer>
  );
}
