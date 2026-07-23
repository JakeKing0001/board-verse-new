"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Flame,
  LockKeyhole,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import NavBar from './NavBar';
import { usePieceContext } from './PieceContext';
import {
  getChallenge,
  type ChallengeDifficulty,
  type ChessChallenge,
} from '../../../services/challenge';
import { getChallengeComplete } from '../../../services/challengeComplete';

type DifficultyFilter = 'all' | ChallengeDifficulty;

const difficultyDetails: Record<ChallengeDifficulty, { label: string; badge: string; dot: string }> = {
  beginner: {
    label: 'Base',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200',
    dot: 'bg-emerald-500',
  },
  intermediate: {
    label: 'Intermedia',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-200',
    dot: 'bg-sky-500',
  },
  advanced: {
    label: 'Avanzata',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200',
    dot: 'bg-amber-500',
  },
  expert: {
    label: 'Esperta',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-400/15 dark:text-rose-200',
    dot: 'bg-rose-500',
  },
};

const filters: Array<{ value: DifficultyFilter; label: string }> = [
  { value: 'all', label: 'Tutte' },
  { value: 'beginner', label: 'Base' },
  { value: 'intermediate', label: 'Intermedie' },
  { value: 'advanced', label: 'Avanzate' },
  { value: 'expert', label: 'Esperte' },
];

export default function Challenge() {
  const {
    challenges,
    setChallenges,
    completedChallenges,
    setCompletedChallenges,
    user,
    t,
    darkMode,
  } = usePieceContext();
  const [filter, setFilter] = useState<DifficultyFilter>('all');
  const [isLoading, setIsLoading] = useState(challenges.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (challenges.length > 0) {
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    getChallenge()
      .then((catalog) => {
        if (active) setChallenges(catalog);
      })
      .catch(() => {
        if (active) setError('Non è stato possibile caricare le challenge.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [challenges.length, setChallenges]);

  useEffect(() => {
    if (!user) {
      setCompletedChallenges([]);
      return;
    }

    let active = true;
    getChallengeComplete()
      .then((completed) => {
        if (active) setCompletedChallenges(completed);
      })
      .catch(() => {
        if (active) setError('Le challenge completate non sono disponibili.');
      });

    return () => {
      active = false;
    };
  }, [setCompletedChallenges, user]);

  const completedIds = useMemo(
    () => new Set(completedChallenges.map((completed) => completed.challenge_id)),
    [completedChallenges],
  );

  const orderedChallenges = useMemo(
    () =>
      ([...challenges] as ChessChallenge[]).sort(
        (first, second) =>
          (first.sort_order ?? first.id) - (second.sort_order ?? second.id),
      ),
    [challenges],
  );

  const visibleChallenges = useMemo(
    () =>
      filter === 'all'
        ? orderedChallenges
        : orderedChallenges.filter((challenge) => challenge.difficulty === filter),
    [filter, orderedChallenges],
  );

  const completedCount = orderedChallenges.filter((challenge) => completedIds.has(challenge.id)).length;
  const progress = orderedChallenges.length
    ? Math.round((completedCount / orderedChallenges.length) * 100)
    : 0;
  const nextChallenge = orderedChallenges.find((challenge) => !completedIds.has(challenge.id));

  return (
    <div className="bv-page">
      <div className="bv-nav-slot">
        <NavBar current={-1} />
      </div>

      <main
        className="bv-page-with-nav relative min-h-screen overflow-hidden px-4 pb-20 text-[var(--bv-text)] sm:px-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.13),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(245,158,11,0.11),transparent_28%)]" />

        <div className="relative mx-auto max-w-6xl">
          <section
            className={`bv-glass bv-liquid mb-8 overflow-hidden rounded-3xl border p-6 shadow-xl sm:p-8 ${
              darkMode
                ? 'border-white/10 bg-slate-900/80 shadow-black/20'
                : 'border-white/80 bg-white/80 shadow-emerald-900/10'
            } backdrop-blur-xl`}
          >
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${darkMode ? 'bg-emerald-400/10 text-emerald-300' : 'bg-emerald-100 text-emerald-800'}`}>
                  <Sparkles className="h-4 w-4" />
                  Allenamento tattico
                </div>
                <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                  {t.challenge || 'Challenge'}
                </h1>
                <p className={`mt-3 max-w-xl text-base leading-7 sm:text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {t.challengeDescription || 'Risolvi posizioni selezionate e costruisci una serie di successi.'}
                </p>
              </div>

              <div className={`min-w-full rounded-2xl border p-5 sm:min-w-[320px] ${darkMode ? 'border-white/10 bg-white/5' : 'border-emerald-100 bg-emerald-50/70'}`}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    <Trophy className={`h-5 w-5 ${darkMode ? 'text-amber-300' : 'text-amber-600'}`} />
                    Progresso
                  </div>
                  <span className="text-sm font-bold tabular-nums">{completedCount}/{orderedChallenges.length}</span>
                </div>
                <div className={`h-2.5 overflow-hidden rounded-full ${darkMode ? 'bg-slate-700' : 'bg-emerald-100'}`}>
                  <div
                    role="progressbar"
                    aria-label="Progresso challenge"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-[width] duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className={`mt-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {progress}% del percorso completato
                </p>
              </div>
            </div>
          </section>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-1" aria-label="Filtra per difficoltà">
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  aria-pressed={filter === item.value}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    filter === item.value
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : darkMode
                        ? 'border-white/10 bg-slate-900 text-slate-300 hover:border-emerald-400/40 hover:text-white'
                        : 'border-slate-200 bg-white/80 text-slate-600 hover:border-emerald-300 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {visibleChallenges.length} posizioni disponibili
            </p>
          </div>

          {isLoading ? (
            <ChallengeSkeleton darkMode={darkMode} />
          ) : error && orderedChallenges.length === 0 ? (
            <div className={`rounded-3xl border p-10 text-center ${darkMode ? 'border-rose-400/20 bg-rose-400/5' : 'border-rose-100 bg-white/80'}`}>
              <CircleHelp className="mx-auto mb-4 h-10 w-10 text-rose-500" />
              <p className="font-semibold text-rose-500">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 rounded-full bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700"
              >
                {t.retry || 'Riprova'}
              </button>
            </div>
          ) : (
            visibleChallenges.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visibleChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    isCompleted={completedIds.has(challenge.id)}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            ) : (
              <div className={`rounded-3xl border p-8 text-center ${darkMode ? 'border-white/10 bg-slate-900/80 text-slate-300' : 'border-white bg-white/80 text-slate-600'}`}>
                Nessuna challenge disponibile per questa difficoltà.
              </div>
            )
          )}

          {!user && !isLoading && (
            <div className={`mt-7 flex items-start gap-3 rounded-2xl border p-4 text-sm ${darkMode ? 'border-amber-300/20 bg-amber-300/5 text-amber-100' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
              <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" />
              <p>Puoi provare tutte le posizioni. Accedi per salvare progressi, serie e statistiche.</p>
            </div>
          )}

          {nextChallenge && !isLoading && (
            <Link
              href={{
                pathname: '/chessboard',
                query: {
                  mode: 'challenge',
                  time: 0,
                  challengeId: nextChallenge.id,
                  fen_challenge: nextChallenge.fen,
                  check_moves: nextChallenge.number_moves,
                },
              }}
              className={`mt-8 flex items-center justify-between rounded-3xl border p-5 no-underline transition hover:-translate-y-0.5 hover:shadow-lg ${darkMode ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100' : 'border-emerald-200 bg-emerald-600 text-white'}`}
            >
              <div className="flex items-center gap-3">
                <Target className="h-7 w-7" />
                <div>
                  <p className="text-sm opacity-80">Prossimo obiettivo</p>
                  <p className="font-bold">{nextChallenge.title}</p>
                </div>
              </div>
              <ChevronRight className="h-6 w-6" />
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

function ChallengeCard({
  challenge,
  isCompleted,
  darkMode,
}: {
  challenge: ChessChallenge;
  isCompleted: boolean;
  darkMode: boolean;
}) {
  const difficulty = difficultyDetails[challenge.difficulty] ?? difficultyDetails.beginner;

  return (
    <Link
      href={{
        pathname: '/chessboard',
        query: {
          mode: 'challenge',
          time: 0,
          challengeId: challenge.id,
          fen_challenge: challenge.fen,
          check_moves: challenge.number_moves,
        },
      }}
      className={`bv-glass-soft bv-card group relative flex min-h-72 flex-col overflow-hidden rounded-3xl border p-6 no-underline shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
        darkMode
          ? 'border-white/10 bg-slate-900/80 text-slate-100 hover:border-emerald-400/30'
          : 'border-white bg-white/85 text-slate-900 hover:border-emerald-200'
      }`}
    >
      <div className={`absolute -right-12 -top-12 h-36 w-36 rounded-full blur-3xl ${isCompleted ? 'bg-emerald-400/20' : 'bg-amber-300/15'}`} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`grid h-11 w-11 place-items-center rounded-2xl text-lg font-black tabular-nums ${darkMode ? 'bg-white/10' : 'bg-slate-100'}`}>
            {String(challenge.sort_order ?? challenge.id).padStart(2, '0')}
          </span>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${difficulty.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${difficulty.dot}`} />
            {difficulty.label}
          </span>
        </div>
        {isCompleted ? (
          <CheckCircle2 className="h-7 w-7 text-emerald-500" aria-label="Completata" />
        ) : (
          <Flame className={`h-6 w-6 ${darkMode ? 'text-amber-300' : 'text-amber-500'}`} />
        )}
      </div>

      <div className="relative mt-6 flex-1">
        <p className={`text-xs font-bold uppercase tracking-[0.18em] ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
          {challenge.theme}
        </p>
        <h2 className="mt-2 text-xl font-black tracking-tight">{challenge.title}</h2>
        <p className={`mt-3 line-clamp-3 text-sm leading-6 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          {challenge.description}
        </p>
      </div>

      <div className={`relative mt-6 flex items-center justify-between border-t pt-4 text-sm ${darkMode ? 'border-white/10 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
        <span>{challenge.number_moves === 1 ? 'Matto in 1' : `Matto in ${challenge.number_moves}`}</span>
        <span className="font-semibold">Rating {challenge.rating}</span>
        <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function ChallengeSkeleton({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Caricamento challenge">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className={`h-72 animate-pulse rounded-3xl border ${darkMode ? 'border-white/10 bg-slate-900' : 'border-white bg-white/80'}`}
        />
      ))}
    </div>
  );
}
