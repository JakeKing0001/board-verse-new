"use client";

import {
  ArrowRight,
  Bot,
  ChartNoAxesCombined,
  Puzzle,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import NavBar from "./NavBar";
import { usePieceContext } from "./PieceContext";

const previewPieces = ["♜", "♞", "♝", "♛", "♔", "♙", "♟", "♚"];

const MainPage = () => {
  const { isLoggedIn, t } = usePieceContext();
  const playHref = isLoggedIn ? "/gameMode" : "/login";

  const features = [
    {
      icon: Bot,
      title: t.homeFeatureAi || "Allenati con Stockfish",
      description: t.homeFeatureAiDescription || "Scegli il livello e affronta un motore affidabile.",
      accent: "from-violet-500 to-indigo-500",
    },
    {
      icon: Puzzle,
      title: t.homeFeatureChallenge || "Risolvi challenge",
      description: t.homeFeatureChallengeDescription || "Affina tattica, visione e precisione mossa dopo mossa.",
      accent: "from-amber-400 to-orange-500",
    },
    {
      icon: ChartNoAxesCombined,
      title: t.homeFeatureStats || "Misura i progressi",
      description: t.homeFeatureStatsDescription || "Statistiche private e leggibili per capire dove migliori.",
      accent: "from-emerald-400 to-teal-500",
    },
  ];

  return (
    <div className="bv-page">
      <div className="bv-nav-slot">
        <NavBar current={0} />
      </div>

      <main className="bv-page-with-nav pb-10 sm:pb-16">
        <section className="bv-shell grid min-h-[calc(100svh-7rem)] items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-16">
          <div className="relative z-10">
            <span className="bv-eyebrow">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              {t.homeEyebrow || "La tua arena strategica"}
            </span>

            <h1 className="bv-title mt-6">
              Pensa.
              <br />
              Gioca.
              <br />
              <span className="bv-title-gradient">Evolvi.</span>
            </h1>

            <p className="bv-lead mt-7">
              {t.homeHeroDescription || t.mainPageDescription}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={playHref}
                onClick={() => {
                  if (!isLoggedIn) toast.error(t.loginToPlay);
                }}
                className="bv-button-primary group px-6"
              >
                {t.play}
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/challenge" className="bv-button-ghost px-6">
                <Puzzle aria-hidden="true" className="h-4 w-4 text-violet-500" />
                {t.challenges}
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[var(--bv-muted)]">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck aria-hidden="true" className="h-4 w-4 text-emerald-500" />
                {t.homePrivate || "Dati protetti"}
              </span>
              <span className="inline-flex items-center gap-2">
                <Zap aria-hidden="true" className="h-4 w-4 text-amber-500" />
                {t.homeFast || "Esperienza veloce"}
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[34rem] lg:mx-0 lg:ml-auto">
            <div
              aria-hidden="true"
              className="absolute -inset-8 rounded-[4rem] bg-gradient-to-br from-emerald-400/20 via-violet-400/10 to-amber-300/20 blur-3xl"
            />

            <div className="bv-glass bv-liquid relative rounded-[2.5rem] p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
                    BoardVerse
                  </p>
                  <p className="mt-1 text-xl font-black">Focus mode</p>
                </div>
                <span className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-200">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Live
                </span>
              </div>

              <div className="relative mx-auto mt-5 aspect-square w-[78%] rotate-[-2deg] rounded-[1.6rem] border border-white/25 bg-[#6f4937] p-2 shadow-2xl sm:p-3">
                <div className="grid h-full grid-cols-4 overflow-hidden rounded-xl">
                  {Array.from({ length: 16 }).map((_, index) => {
                    const piece = previewPieces[index % previewPieces.length];
                    return (
                      <div
                        key={index}
                        className={`grid place-items-center text-[clamp(1.7rem,5vw,3.5rem)] ${
                          (Math.floor(index / 4) + index) % 2 === 0
                            ? "bg-[#efd9b3] text-slate-900"
                            : "bg-[#9a6147] text-white"
                        }`}
                      >
                        {index === 5 || index === 10 ? "" : piece}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="bv-glass-strong min-w-0 flex-1 rounded-2xl px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--bv-muted)]">
                    Analisi posizione
                  </p>
                  <p className="mt-0.5 truncate text-sm font-black text-emerald-600 dark:text-emerald-300">
                    +1.24 · Mossa forte
                  </p>
                </div>

                <div className="bv-glass-strong grid h-12 w-12 shrink-0 place-items-center rounded-2xl">
                  <Bot aria-hidden="true" className="h-6 w-6 text-violet-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bv-shell bv-defer pb-8" aria-label="Funzionalità principali">
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="bv-glass-soft bv-card rounded-[var(--bv-radius)] p-5 sm:p-6">
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${feature.accent} text-white shadow-lg`}>
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <h2 className="mt-5 text-lg font-black">{feature.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--bv-muted)]">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default MainPage;
