"use client";

import {
    ArrowRight,
    Bot,
    CalendarDays,
    Clock3,
    Edit3,
    Gauge,
    Hourglass,
    Sparkles,
    Timer,
    Users,
    X,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import {
    normalizeStockfishDifficulty,
    STOCKFISH_LEVELS,
} from '../../lib/stockfish';
import NavBar from './NavBar';
import { usePieceContext } from './PieceContext';

type GameMode = 'ai' | 'multiplayer';

interface TimeOption {
    value: string;
    label: string;
    seconds: number;
    recommended?: boolean;
}

interface TimeCategory {
    id: 'quick' | 'standard' | 'daily';
    label: string;
    description: string;
    icon: LucideIcon;
    options: TimeOption[];
}

const formatDuration = (totalSeconds: number) => {
    if (totalSeconds <= 0) return '0 s';

    const units = [
        { seconds: 86_400, suffix: 'g' },
        { seconds: 3_600, suffix: 'h' },
        { seconds: 60, suffix: 'min' },
        { seconds: 1, suffix: 's' },
    ];
    const parts: string[] = [];
    let remaining = totalSeconds;

    for (const unit of units) {
        const amount = Math.floor(remaining / unit.seconds);
        if (amount > 0) {
            parts.push(`${amount} ${unit.suffix}`);
            remaining %= unit.seconds;
        }
        if (parts.length === 2) break;
    }

    return parts.join(' ');
};

const categoryStyles = {
    quick: {
        icon: 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950',
        glow: 'bg-amber-400/20',
        hover: 'hover:border-amber-400/60 hover:shadow-amber-500/10',
    },
    standard: {
        icon: 'bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950',
        glow: 'bg-emerald-400/20',
        hover: 'hover:border-emerald-400/60 hover:shadow-emerald-500/10',
    },
    daily: {
        icon: 'bg-gradient-to-br from-sky-400 to-indigo-500 text-white',
        glow: 'bg-sky-400/20',
        hover: 'hover:border-sky-400/60 hover:shadow-sky-500/10',
    },
} as const;

function CustomTimeForm({
    onClose,
    onSubmit,
}: {
    onClose: () => void;
    onSubmit: (totalSeconds: number) => void;
}) {
    const [values, setValues] = useState({
        days: '',
        hours: '',
        minutes: '',
        seconds: '',
    });
    const { t, darkMode } = usePieceContext();

    useEffect(() => {
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [onClose]);

    const totalSeconds =
        (parseInt(values.days, 10) || 0) * 86_400
        + (parseInt(values.hours, 10) || 0) * 3_600
        + (parseInt(values.minutes, 10) || 0) * 60
        + (parseInt(values.seconds, 10) || 0);
    const canSubmit = totalSeconds >= 30;

    const fields = [
        { id: 'days', label: t.days, max: 99 },
        { id: 'hours', label: t.hours, max: 23 },
        { id: 'minutes', label: t.minutes, max: 59 },
        { id: 'seconds', label: t.seconds, max: 59 },
    ] as const;

    const updateValue = (field: keyof typeof values, value: string, max: number) => {
        const digits = value.replace(/\D/g, '');
        setValues((current) => ({
            ...current,
            [field]: digits === '' ? '' : String(Math.min(Number(digits), max)),
        }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (canSubmit) onSubmit(totalSeconds);
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="custom-time-title"
                className={`relative w-full max-w-xl overflow-hidden rounded-[2rem] border shadow-2xl ${
                    darkMode
                        ? 'border-white/10 bg-slate-900 text-white'
                        : 'border-white/80 bg-white text-slate-900'
                }`}
            >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-500" />
                <div className="p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
                                <Edit3 aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-500">
                                    BoardVerse
                                </p>
                                <h2 id="custom-time-title" className="mt-1 text-2xl font-black tracking-tight">
                                    {t.customTimeTitle}
                                </h2>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label={t.cancel}
                            className={`rounded-full p-2 transition ${
                                darkMode
                                    ? 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'
                            }`}
                        >
                            <X aria-hidden="true" className="h-5 w-5" />
                        </button>
                    </div>

                    <div className={`mt-7 rounded-2xl border p-4 ${
                        darkMode
                            ? 'border-emerald-400/20 bg-emerald-400/5'
                            : 'border-emerald-200 bg-emerald-50'
                    }`}>
                        <span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-500">
                            {t.timePerPlayer}
                        </span>
                        <div className="mt-1 flex items-center gap-2">
                            <Clock3 aria-hidden="true" className="h-5 w-5 text-emerald-500" />
                            <strong className="text-2xl font-black">{formatDuration(totalSeconds)}</strong>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {fields.map((field) => (
                                <label key={field.id} htmlFor={`custom-${field.id}`} className="block">
                                    <span className={`mb-2 block text-xs font-bold uppercase tracking-wider ${
                                        darkMode ? 'text-slate-400' : 'text-slate-500'
                                    }`}>
                                        {field.label}
                                    </span>
                                    <input
                                        id={`custom-${field.id}`}
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="off"
                                        value={values[field.id]}
                                        onChange={(event) => updateValue(field.id, event.target.value, field.max)}
                                        placeholder="00"
                                        className={`w-full rounded-2xl border px-4 py-3 text-center text-lg font-bold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 ${
                                            darkMode
                                                ? 'border-white/10 bg-slate-950/60 text-white placeholder:text-slate-600'
                                                : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-300'
                                        }`}
                                    />
                                </label>
                            ))}
                        </div>

                        <p className={`mt-3 text-sm ${canSubmit ? 'text-emerald-500' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {canSubmit ? t.timeCustomDescription : t.timeMinimumHint}
                        </p>

                        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={onClose}
                                className={`flex-1 rounded-2xl px-5 py-3.5 font-bold transition ${
                                    darkMode
                                        ? 'bg-white/5 text-slate-200 hover:bg-white/10'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {t.cancel}
                            </button>
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="group flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {t.timeStartCustom}
                                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
}

export default function ChooseTime() {
    const [showCustomForm, setShowCustomForm] = useState(false);
    const { t, darkMode, setTime, mode, setMode } = usePieceContext();
    const searchParams = useSearchParams();
    const router = useRouter();

    const modeFromQuery = searchParams.get('mode');
    const selectedMode: GameMode = modeFromQuery === 'ai' || modeFromQuery === 'multiplayer'
        ? modeFromQuery
        : mode === 'ai' || mode === 'multiplayer'
            ? mode
            : 'multiplayer';
    const [difficulty, setDifficulty] = useState(() => (
        normalizeStockfishDifficulty(searchParams.get('difficulty'))
    ));
    const difficultyConfig = STOCKFISH_LEVELS[difficulty - 1];
    const difficultyLabel = t[difficultyConfig.key];
    const difficultyQuery = selectedMode === 'ai' ? `&difficulty=${difficulty}` : '';

    useEffect(() => {
        setMode(selectedMode);
    }, [selectedMode, setMode]);

    const categories = useMemo<TimeCategory[]>(() => [
        {
            id: 'quick',
            label: t.quick,
            description: t.timeQuickDescription,
            icon: Zap,
            options: [
                { value: '30s', label: '30 sec', seconds: 30 },
                { value: '1m', label: '1 min', seconds: 60 },
                { value: '2m', label: '2 min', seconds: 120 },
                { value: '3m', label: '3 min', seconds: 180 },
            ],
        },
        {
            id: 'standard',
            label: t.standard,
            description: t.timeStandardDescription,
            icon: Hourglass,
            options: [
                { value: '5m', label: '5 min', seconds: 300 },
                { value: '10m', label: '10 min', seconds: 600, recommended: true },
                { value: '15m', label: '15 min', seconds: 900 },
                { value: '20m', label: '20 min', seconds: 1_200 },
                { value: '30m', label: '30 min', seconds: 1_800 },
                { value: '60m', label: '60 min', seconds: 3_600 },
            ],
        },
        {
            id: 'daily',
            label: t.daily,
            description: t.timeDailyDescription,
            icon: CalendarDays,
            options: [
                { value: '1d', label: `1 ${t.daySingular}`, seconds: 86_400 },
                { value: '2d', label: `2 ${t.days}`, seconds: 172_800 },
                { value: '3d', label: `3 ${t.days}`, seconds: 259_200 },
                { value: '5d', label: `5 ${t.days}`, seconds: 432_000 },
                { value: '14d', label: `14 ${t.days}`, seconds: 1_209_600 },
            ],
        },
    ], [t]);

    const startCustomGame = (totalSeconds: number) => {
        setTime(totalSeconds);
        setShowCustomForm(false);
        router.push(`/chessboard?mode=${selectedMode}&time=${totalSeconds}${difficultyQuery}`);
    };

    const ModeIcon = selectedMode === 'ai' ? Bot : Users;

    return (
        <div className="bv-page">
            <div className="bv-nav-slot">
                <NavBar current={1} />
            </div>
            <main className="bv-page-with-nav relative min-h-screen overflow-hidden text-[var(--bv-text)]">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                    <div className={`absolute -left-28 top-20 h-80 w-80 rounded-full blur-3xl ${darkMode ? 'bg-emerald-500/10' : 'bg-emerald-300/25'}`} />
                    <div className={`absolute -right-20 top-1/3 h-96 w-96 rounded-full blur-3xl ${darkMode ? 'bg-sky-500/10' : 'bg-amber-300/25'}`} />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.055)_1px,transparent_1px)] bg-[size:34px_34px]" />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                    <header className="mx-auto max-w-3xl text-center">
                        <div className={`mx-auto inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold shadow-sm ${
                            darkMode
                                ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                                : 'border-emerald-200 bg-white/80 text-emerald-700'
                        }`}>
                            <ModeIcon aria-hidden="true" className="h-4 w-4" />
                            {selectedMode === 'ai' ? t.ai : t.multiplayer}
                        </div>

                        <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                            {t.chooseTimeTitle}
                        </h1>
                        <p className={`mx-auto mt-4 max-w-2xl text-base leading-7 sm:text-lg ${
                            darkMode ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                            {t.chooseTimeDescription}
                        </p>

                        <div className={`mx-auto mt-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                            darkMode ? 'bg-white/5 text-slate-400' : 'bg-white/70 text-slate-500'
                        }`}>
                            <Timer aria-hidden="true" className="h-4 w-4" />
                            {t.timePerPlayer}
                        </div>
                    </header>

                    {selectedMode === 'ai' && (
                        <section
                            className={`relative mx-auto mt-10 max-w-4xl overflow-hidden rounded-[2rem] border p-5 shadow-xl sm:p-7 ${
                                darkMode
                                    ? 'border-violet-400/20 bg-slate-900/85'
                                    : 'border-violet-100 bg-white/85 backdrop-blur-xl'
                            }`}
                        >
                            <div
                                aria-hidden="true"
                                className={`absolute -right-20 -top-24 h-64 w-64 rounded-full blur-3xl ${
                                    darkMode ? 'bg-violet-500/15' : 'bg-violet-300/30'
                                }`}
                            />
                            <div className="relative flex flex-col gap-6">
                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                    <div className="flex items-start gap-4">
                                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
                                            <Gauge aria-hidden="true" className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <h2 className="text-xl font-black">{t.stockfishDifficulty}</h2>
                                            <p className={`mt-1 max-w-xl text-sm leading-6 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {t.stockfishDifficultyDescription}
                                            </p>
                                        </div>
                                    </div>
                                    <output
                                        htmlFor="stockfish-difficulty"
                                        className={`inline-flex shrink-0 items-center gap-2 self-start rounded-2xl border px-4 py-2 text-sm font-black sm:self-center ${
                                            darkMode
                                                ? 'border-violet-400/25 bg-violet-400/10 text-violet-200'
                                                : 'border-violet-200 bg-violet-50 text-violet-800'
                                        }`}
                                    >
                                        <span>{difficultyLabel}</span>
                                        <span className="opacity-55">{difficulty}/5</span>
                                    </output>
                                </div>

                                <div>
                                    <input
                                        id="stockfish-difficulty"
                                        type="range"
                                        min="1"
                                        max="5"
                                        step="1"
                                        value={difficulty}
                                        onChange={(event) => setDifficulty(normalizeStockfishDifficulty(event.target.value))}
                                        aria-label={t.stockfishDifficulty}
                                        aria-valuetext={`${difficultyLabel}, ${difficulty} / 5`}
                                        className="stockfish-range w-full"
                                    />
                                    <div className={`mt-3 grid grid-cols-5 text-center text-[10px] font-bold uppercase tracking-wide sm:text-xs ${
                                        darkMode ? 'text-slate-500' : 'text-slate-400'
                                    }`}>
                                        {STOCKFISH_LEVELS.map((level) => (
                                            <span
                                                key={level.level}
                                                className={level.level === difficulty ? (darkMode ? 'text-violet-300' : 'text-violet-700') : ''}
                                            >
                                                {level.level}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    <div className="mt-8 grid gap-5 lg:grid-cols-3">
                        {categories.map((category) => {
                            const Icon = category.icon;
                            const styles = categoryStyles[category.id];

                            return (
                                <section
                                    key={category.id}
                                    className={`group relative overflow-hidden rounded-[2rem] border p-5 shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${styles.hover} ${
                                        darkMode
                                            ? 'border-white/10 bg-slate-900/80'
                                            : 'border-white/90 bg-white/80 backdrop-blur-xl'
                                    }`}
                                >
                                    <div aria-hidden="true" className={`absolute -right-12 -top-12 h-36 w-36 rounded-full blur-3xl ${styles.glow}`} />
                                    <div className="relative flex items-start gap-4">
                                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg ${styles.icon}`}>
                                            <Icon aria-hidden="true" className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <h2 className="text-xl font-black">{category.label}</h2>
                                            <p className={`mt-1 text-sm leading-6 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {category.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative mt-6 grid grid-cols-2 gap-2.5">
                                        {category.options.map((option) => (
                                            <Link
                                                key={option.value}
                                                href={`/chessboard?mode=${selectedMode}&time=${option.seconds}${difficultyQuery}`}
                                                onClick={() => setTime(option.seconds)}
                                                aria-label={`${option.label} — ${t.timePerPlayer}`}
                                                className={`group/option relative flex min-h-16 items-center justify-between overflow-hidden rounded-2xl border px-4 py-3 font-bold transition duration-200 hover:-translate-y-0.5 ${
                                                    darkMode
                                                        ? 'border-white/10 bg-slate-950/50 text-white hover:border-emerald-400/40 hover:bg-slate-800'
                                                        : 'border-slate-200/80 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50'
                                                }`}
                                            >
                                                <span>{option.label}</span>
                                                <ArrowRight aria-hidden="true" className="h-4 w-4 opacity-35 transition group-hover/option:translate-x-1 group-hover/option:opacity-100" />
                                                {option.recommended && (
                                                    <span className="absolute right-2 top-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                                                        {t.timeRecommended}
                                                    </span>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>

                    <section className={`relative mt-5 overflow-hidden rounded-[2rem] border p-6 shadow-xl sm:p-8 ${
                        darkMode
                            ? 'border-white/10 bg-gradient-to-r from-slate-900 to-slate-900/70'
                            : 'border-white/90 bg-white/80 backdrop-blur-xl'
                    }`}>
                        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                            <div className="flex items-start gap-4">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20">
                                    <Sparkles aria-hidden="true" className="h-5 w-5" />
                                </span>
                                <div>
                                    <h2 className="text-xl font-black">{t.customTimeTitle}</h2>
                                    <p className={`mt-1 max-w-xl text-sm leading-6 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {t.timeCustomDescription}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCustomForm(true)}
                                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 font-bold text-white shadow-lg transition hover:bg-emerald-500 sm:w-auto"
                            >
                                <Edit3 aria-hidden="true" className="h-4 w-4" />
                                {t.customTimeButton}
                                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </section>
                </div>
            </main>

            {showCustomForm && (
                <CustomTimeForm
                    onClose={() => setShowCustomForm(false)}
                    onSubmit={startCustomGame}
                />
            )}
        </div>
    );
}
