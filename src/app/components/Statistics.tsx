"use client";

import { useEffect, useMemo, useState, type ComponentType } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Activity,
  BarChart3,
  CircleEqual,
  Clock3,
  Flame,
  Gamepad2,
  Medal,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import NavBar from './NavBar';
import { usePieceContext } from './PieceContext';
import {
  emptyStatistics,
  getStatistics,
  type UserStatistics,
} from '../../../services/statistics';

interface ProgressPoint {
  month: string;
  partite: number;
  vittorie: number;
}

interface PerformancePoint {
  name: string;
  value: number;
  color: string;
}

interface WeeklyPoint {
  day: string;
  partite: number;
}

const chartLoading = () => <div className="h-[280px] animate-pulse rounded-2xl bg-slate-500/10" />;

const ProgressChart = dynamic(
  () => import('./charts/StatisticsCharts').then((module) => module.ProgressChart),
  { ssr: false, loading: chartLoading },
) as ComponentType<{ data: ProgressPoint[]; darkMode: boolean }>;

const PerformancePieChart = dynamic(
  () => import('./charts/StatisticsCharts').then((module) => module.PerformancePieChart),
  { ssr: false, loading: chartLoading },
) as ComponentType<{ data: PerformancePoint[]; darkMode: boolean }>;

const WeeklyActivityChart = dynamic(
  () => import('./charts/StatisticsCharts').then((module) => module.WeeklyActivityChart),
  { ssr: false, loading: chartLoading },
) as ComponentType<{ data: WeeklyPoint[]; darkMode: boolean }>;

export default function Statistics() {
  const { user, t, darkMode, language } = usePieceContext();
  const [stats, setStats] = useState<UserStatistics>(emptyStatistics);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setStats(emptyStatistics);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setError(null);

    getStatistics()
      .then((data) => {
        if (active) setStats(data);
      })
      .catch(() => {
        if (active) setError('Non è stato possibile caricare le statistiche.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const locale = language || 'it';
  const progressData = useMemo<ProgressPoint[]>(
    () =>
      stats.monthly.map((item) => ({
        month: new Intl.DateTimeFormat(locale, { month: 'short' }).format(
          new Date(`${item.period}-01T12:00:00`),
        ),
        partite: item.matches,
        vittorie: item.wins,
      })),
    [locale, stats.monthly],
  );

  const weeklyData = useMemo<WeeklyPoint[]>(
    () =>
      stats.weekly.map((item) => ({
        day: new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
          new Date(`${item.day}T12:00:00`),
        ),
        partite: item.matches,
      })),
    [locale, stats.weekly],
  );

  const performanceData = useMemo<PerformancePoint[]>(
    () => [
      { name: t.wins || 'Vittorie', value: stats.wins, color: darkMode ? '#34d399' : '#059669' },
      { name: t.losses || 'Sconfitte', value: stats.losses, color: darkMode ? '#fb7185' : '#e11d48' },
      { name: t.draws || 'Pareggi', value: stats.draws, color: darkMode ? '#fbbf24' : '#d97706' },
    ],
    [darkMode, stats.draws, stats.losses, stats.wins, t.draws, t.losses, t.wins],
  );

  const winRate = stats.matchesPlayed > 0
    ? Math.round((stats.wins / stats.matchesPlayed) * 100)
    : 0;

  return (
    <div className="bv-page">
      <div className="bv-nav-slot">
        <NavBar current={2} />
      </div>

      <main
        className="bv-page-with-nav relative min-h-screen overflow-hidden px-4 pb-20 text-[var(--bv-text)] sm:px-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_6%,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(245,158,11,0.12),transparent_26%)]" />
        <div className="relative mx-auto max-w-6xl">
          <header
            className={`bv-glass bv-liquid mb-7 overflow-hidden rounded-3xl border p-6 shadow-xl sm:p-8 ${
              darkMode
                ? 'border-white/10 bg-slate-900/80 shadow-black/20'
                : 'border-white/80 bg-white/80 shadow-emerald-900/10'
            } backdrop-blur-xl`}
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ${darkMode ? 'bg-emerald-400/10 text-emerald-300' : 'bg-emerald-100 text-emerald-800'}`}>
                  <Activity className="h-4 w-4" />
                  Dati aggiornati dalle tue partite
                </span>
                <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                  {t.statistics || 'Statistiche'}
                </h1>
                <p className={`mt-3 max-w-xl leading-7 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Una vista reale di risultati, costanza e attività di {user?.username || 'BoardVerse'}.
                </p>
              </div>
              {user && !isLoading && !error && (
                <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${darkMode ? 'border-white/10 bg-white/5' : 'border-amber-100 bg-amber-50'}`}>
                  <Medal className={`h-8 w-8 ${darkMode ? 'text-amber-300' : 'text-amber-600'}`} />
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Classifica</p>
                    <p className="text-lg font-black tabular-nums">#{stats.ranking} <span className="text-sm font-medium opacity-60">su {stats.totalPlayers}</span></p>
                  </div>
                </div>
              )}
            </div>
          </header>

          {!user ? (
            <LoginState darkMode={darkMode} />
          ) : isLoading ? (
            <StatisticsSkeleton darkMode={darkMode} />
          ) : error ? (
            <ErrorState message={error} darkMode={darkMode} />
          ) : (
            <>
              <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Riepilogo statistiche">
                <StatCard
                  label={t.matchesPlayed || 'Partite giocate'}
                  value={stats.matchesPlayed.toLocaleString(locale)}
                  note={`${stats.draws} pareggi`}
                  icon={Gamepad2}
                  accent="sky"
                  darkMode={darkMode}
                />
                <StatCard
                  label={t.wins || 'Vittorie'}
                  value={stats.wins.toLocaleString(locale)}
                  note={`${stats.losses} sconfitte`}
                  icon={Trophy}
                  accent="emerald"
                  darkMode={darkMode}
                />
                <StatCard
                  label="Percentuale vittorie"
                  value={`${winRate}%`}
                  note={stats.matchesPlayed ? 'Su partite completate' : 'Gioca la prima partita'}
                  icon={TrendingUp}
                  accent="amber"
                  darkMode={darkMode}
                />
                <StatCard
                  label="Punti esperienza"
                  value={stats.experiencePoints.toLocaleString(locale)}
                  note={`${stats.challengesCompleted} challenge completate`}
                  icon={Sparkles}
                  accent="violet"
                  darkMode={darkMode}
                />
              </section>

              <section className="mb-7 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
                <ChartCard
                  title="Progressi negli ultimi 6 mesi"
                  description="Partite completate e vittorie, mese per mese."
                  icon={BarChart3}
                  darkMode={darkMode}
                >
                  <ProgressChart data={progressData} darkMode={darkMode} />
                </ChartCard>

                <ChartCard
                  title="Bilancio risultati"
                  description="Distribuzione delle partite completate."
                  icon={Target}
                  darkMode={darkMode}
                >
                  <PerformancePieChart data={performanceData} darkMode={darkMode} />
                  <div className="mt-2 flex flex-wrap justify-center gap-4">
                    {performanceData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              </section>

              <section className="mb-7 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                <ChartCard
                  title="Attività degli ultimi 7 giorni"
                  description="Quante partite hai completato ogni giorno."
                  icon={Activity}
                  darkMode={darkMode}
                >
                  <WeeklyActivityChart data={weeklyData} darkMode={darkMode} />
                </ChartCard>

                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                  <InsightCard
                    icon={Flame}
                    title="Serie attuale"
                    value={`${stats.currentWinStreak} vittorie`}
                    note={`Record personale: ${stats.bestWinStreak}`}
                    darkMode={darkMode}
                  />
                  <InsightCard
                    icon={Clock3}
                    title="Durata media"
                    value={formatDuration(stats.averageGameDurationSeconds)}
                    note="Per partita completata"
                    darkMode={darkMode}
                  />
                  <InsightCard
                    icon={CircleEqual}
                    title="Challenge"
                    value={stats.challengesCompleted.toLocaleString(locale)}
                    note="Puzzle risolti correttamente"
                    darkMode={darkMode}
                  />
                </div>
              </section>

              {stats.matchesPlayed === 0 && stats.challengesCompleted === 0 && (
                <div className={`rounded-3xl border p-6 text-center ${darkMode ? 'border-emerald-400/20 bg-emerald-400/5' : 'border-emerald-200 bg-emerald-50'}`}>
                  <Target className="mx-auto mb-3 h-9 w-9 text-emerald-500" />
                  <h2 className="text-xl font-black">Il tuo percorso parte da qui</h2>
                  <p className={`mt-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Completa una partita o una challenge: i grafici si aggiorneranno automaticamente.</p>
                  <Link href="/challenge" className="mt-4 inline-flex rounded-full bg-emerald-600 px-5 py-2.5 font-bold text-white no-underline hover:bg-emerald-700">
                    Inizia una challenge
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

type Accent = 'sky' | 'emerald' | 'amber' | 'violet';

const accentClasses: Record<Accent, { icon: string; value: string }> = {
  sky: { icon: 'bg-sky-500/10 text-sky-500', value: 'text-sky-600 dark:text-sky-300' },
  emerald: { icon: 'bg-emerald-500/10 text-emerald-500', value: 'text-emerald-700 dark:text-emerald-300' },
  amber: { icon: 'bg-amber-500/10 text-amber-500', value: 'text-amber-700 dark:text-amber-300' },
  violet: { icon: 'bg-violet-500/10 text-violet-500', value: 'text-violet-700 dark:text-violet-300' },
};

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  accent,
  darkMode,
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof Gamepad2;
  accent: Accent;
  darkMode: boolean;
}) {
  const colors = accentClasses[accent];
  return (
    <article className={`bv-glass-soft bv-card rounded-3xl border p-5 shadow-sm ${darkMode ? 'border-white/10 bg-slate-900/80' : 'border-white bg-white/85'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
          <p className={`mt-2 text-3xl font-black tabular-nums ${colors.value}`}>{value}</p>
          <p className={`mt-1 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>{note}</p>
        </div>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${colors.icon}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
}

function ChartCard({
  title,
  description,
  icon: Icon,
  darkMode,
  children,
}: {
  title: string;
  description: string;
  icon: typeof Activity;
  darkMode: boolean;
  children: React.ReactNode;
}) {
  return (
    <article className={`bv-glass-soft bv-card rounded-3xl border p-5 shadow-sm sm:p-6 ${darkMode ? 'border-white/10 bg-slate-900/80' : 'border-white bg-white/85'}`}>
      <div className="mb-5 flex items-start gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${darkMode ? 'bg-emerald-400/10 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-black sm:text-lg">{title}</h2>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
        </div>
      </div>
      {children}
    </article>
  );
}

function InsightCard({
  icon: Icon,
  title,
  value,
  note,
  darkMode,
}: {
  icon: typeof Flame;
  title: string;
  value: string;
  note: string;
  darkMode: boolean;
}) {
  return (
    <article className={`bv-glass-soft bv-card flex items-center gap-4 rounded-3xl border p-5 ${darkMode ? 'border-white/10 bg-slate-900/80' : 'border-white bg-white/85'}`}>
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${darkMode ? 'bg-amber-400/10 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
        <p className="mt-0.5 text-xl font-black tabular-nums">{value}</p>
        <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>{note}</p>
      </div>
    </article>
  );
}

function LoginState({ darkMode }: { darkMode: boolean }) {
  return (
    <div className={`rounded-3xl border p-10 text-center ${darkMode ? 'border-white/10 bg-slate-900/80' : 'border-white bg-white/85'}`}>
      <BarChart3 className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
      <h2 className="text-2xl font-black">Accedi alle tue statistiche</h2>
      <p className={`mx-auto mt-2 max-w-md ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>I dati sono privati e collegati al tuo profilo BoardVerse.</p>
      <Link href="/login" className="mt-5 inline-flex rounded-full bg-emerald-600 px-6 py-3 font-bold text-white no-underline hover:bg-emerald-700">Accedi</Link>
    </div>
  );
}

function ErrorState({ message, darkMode }: { message: string; darkMode: boolean }) {
  return (
    <div className={`rounded-3xl border p-10 text-center ${darkMode ? 'border-rose-400/20 bg-rose-400/5' : 'border-rose-100 bg-white/85'}`}>
      <RefreshCw className="mx-auto mb-4 h-10 w-10 text-rose-500" />
      <p className="font-semibold text-rose-500">{message}</p>
      <button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-full bg-emerald-600 px-5 py-2.5 font-bold text-white hover:bg-emerald-700">Riprova</button>
    </div>
  );
}

function StatisticsSkeleton({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="space-y-6" aria-label="Caricamento statistiche">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={`h-36 animate-pulse rounded-3xl border ${darkMode ? 'border-white/10 bg-slate-900' : 'border-white bg-white/80'}`} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className={`h-96 animate-pulse rounded-3xl border ${darkMode ? 'border-white/10 bg-slate-900' : 'border-white bg-white/80'}`} />
        ))}
      </div>
    </div>
  );
}

function formatDuration(totalSeconds: number) {
  if (!totalSeconds) return '0:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
