"use client";

import {
  ArrowUpRight,
  Bot,
  Globe2,
  Puzzle,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import NavBar from "./NavBar";
import { usePieceContext } from "./PieceContext";

interface ModeCard {
  id: "multiplayer" | "ai" | "online" | "challenge";
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  glow: string;
}

export default function ChoosePage() {
  const { setMode, t } = usePieceContext();

  const modes: ModeCard[] = [
    {
      id: "multiplayer",
      label: t.multiplayer,
      description: t.modeMultiplayerDescription || "Due giocatori, una sola scacchiera e tutta la strategia dal vivo.",
      href: "/chooseTime?mode=multiplayer",
      icon: UsersRound,
      accent: "from-emerald-400 to-teal-600",
      glow: "bg-emerald-400/20",
    },
    {
      id: "ai",
      label: t.ai,
      description: t.modeAiDescription || "Sfida Stockfish scegliendo ritmo e difficoltà più adatti a te.",
      href: "/chooseTime?mode=ai",
      icon: Bot,
      accent: "from-violet-500 to-indigo-600",
      glow: "bg-violet-400/20",
    },
    {
      id: "online",
      label: t.online,
      description: t.modeOnlineDescription || "Crea o raggiungi una stanza privata e gioca in tempo reale.",
      href: "/online",
      icon: Globe2,
      accent: "from-sky-400 to-blue-600",
      glow: "bg-sky-400/20",
    },
    {
      id: "challenge",
      label: t.challenge,
      description: t.modeChallengeDescription || "Risolvi posizioni curate e trasforma la tattica in istinto.",
      href: "/challenge",
      icon: Puzzle,
      accent: "from-amber-400 to-orange-600",
      glow: "bg-amber-400/20",
    },
  ];

  return (
    <div className="bv-page">
      <div className="bv-nav-slot">
        <NavBar current={1} />
      </div>

      <main className="bv-page-with-nav">
        <div className="bv-shell py-10 sm:py-14 lg:py-20">
          <header className="mx-auto max-w-3xl text-center">
            <span className="bv-eyebrow">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              {t.gameTypes}
            </span>
            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              {t.chooseMode}
            </h1>
            <p className="bv-lead mx-auto mt-5">
              {t.chooseModeDescription || "Scegli come entrare in partita. Ogni modalità mantiene la stessa esperienza fluida e concentrata."}
            </p>
          </header>

          <section className="relative mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:mt-14" aria-label={t.chooseMode}>
            <div aria-hidden="true" className="pointer-events-none absolute -inset-12 -z-10 rounded-[4rem] bg-gradient-to-br from-emerald-400/10 via-transparent to-violet-400/10 blur-3xl" />
            {modes.map((mode, index) => {
              const Icon = mode.icon;
              return (
                <Link
                  key={mode.id}
                  href={mode.href}
                  aria-label={mode.label}
                  onClick={() => setMode(mode.id)}
                  className={`bv-glass bv-liquid bv-card group relative min-h-56 overflow-hidden rounded-[2rem] p-6 text-[var(--bv-text)] no-underline sm:p-7 ${
                    index % 3 === 0 ? "sm:translate-y-3" : ""
                  }`}
                >
                  <div aria-hidden="true" className={`absolute -right-16 -top-16 h-52 w-52 rounded-full ${mode.glow} blur-3xl transition-transform duration-500 group-hover:scale-125`} />
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between">
                      <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${mode.accent} text-white shadow-lg`}>
                        <Icon aria-hidden="true" className="h-6 w-6" />
                      </span>
                      <span className="grid h-10 w-10 place-items-center rounded-full border border-black/5 bg-white/25 text-[var(--bv-muted)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--bv-text)] dark:border-white/10 dark:bg-white/5">
                        <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="mt-auto pt-8">
                      <h2 className="text-2xl font-black tracking-tight">{mode.label}</h2>
                      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--bv-muted)]">
                        {mode.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>

          <div className="mx-auto mt-12 flex max-w-3xl items-center justify-center gap-5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--bv-muted)]">
            <span>♙ Focus</span>
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            <span>♘ Strategia</span>
            <span className="h-1 w-1 rounded-full bg-violet-400" />
            <span>♕ Crescita</span>
          </div>
        </div>
      </main>
    </div>
  );
}
