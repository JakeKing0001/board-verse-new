import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import { usePieceContext } from './PieceContext';
import Link from 'next/link';


/**
 * Challenge component displays a list of chess challenges in a grid format.
 * It handles loading and error states, and adapts its appearance based on the current dark mode setting.
 * 
 * Features:
 * - Shows a navigation bar at the top.
 * - Displays a header with the challenge title and description.
 * - Renders a grid of challenge items, indicating completed challenges with different styles.
 * - Handles loading and error states with appropriate UI feedback.
 * - Uses context to access challenges, completed challenges, translations, and dark mode state.
 * 
 * Context Dependencies:
 * - `challenges`: Array of available challenge objects.
 * - `completedChallenges`: Array of completed challenge objects.
 * - `t`: Object containing translated strings.
 * - `darkMode`: Boolean indicating if dark mode is enabled.
 * 
 * @component
 * @returns {JSX.Element} The rendered Challenge component.
 */
export default function Challenge() {
    const [error] = useState<string | null>(null); // Stato per gestire eventuali errori
    const [isLoading] = useState(false);

    const { challenges, completedChallenges, t, darkMode } = usePieceContext();

    return (
        <>
            <div className={`fixed top-0 left-0 w-full bg-${darkMode? 'black': 'white'} shadow-md z-50`}>
                <NavBar current={-1} />
            </div>

            <div className={`min-h-screen bg-gradient-to-br ${darkMode? 'from-slate-900 via-slate-500 to-slate-900' : 'from-green-100 via-gray-50 to-green-100'} pt-24 pb-16 px-4`}>
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className={`bg-${darkMode? 'white/10':'gray/30'} backdrop-blur-md rounded-2xl p-6 shadow-lg mb-6`}>
                        <h1 className={`text-3xl font-bold ${darkMode? 'text-slate-200':'text-green-800'}`}>{t.challenge}</h1>
                        <p className={`${darkMode? 'text-slate-300':'text-green-700'} mt-2`}>{t.challengeDescription}</p>
                    </div>

                    {/* Challenge Grid Content */}
                    <div className={`bg-${darkMode? 'white/10':'gray/30'} backdrop-blur-md rounded-2xl shadow-lg overflow-hidden p-6`}>
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className={`animate-spin h-12 w-12 border-4 border-${darkMode? 'slate-700':'green-300'} rounded-full border-t-transparent`}></div>
                            </div>
                        ) : error ? (
                            <div className="text-center p-6">
                                <p className="text-red-500 mb-4">{error}</p>
                                <button
                                    className={`px-6 py-2 bg-${darkMode? 'slate-900':'green-100'} text-${darkMode? 'slate-300':'green-700'} rounded-full hover:bg-${darkMode? 'slate-800':'green-200'} transition-colors text-sm font-medium shadow-sm`}
                                    onClick={() => window.location.reload()}
                                >
                                    {t.retry}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <h2 className={`text-xl font-semibold text-${darkMode? 'slate-200':'green-800'} mb-6`}>{t.challenges}</h2>

                                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-3 max-w-3xl mx-auto">
                                    {challenges
                                        .sort((a, b) => a.id - b.id)
                                        .map((challenge) => {
                                            const isCompleted = completedChallenges.some(
                                                (completed) => completed.challenge_id === challenge.id
                                            );
                                            const baseClasses = "aspect-square flex items-center justify-center rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 active:translate-y-0";
                                            const completedClasses = darkMode
                                                ? "bg-gradient-to-br from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white"
                                                : "bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white";
                                            const normalClasses = darkMode
                                                ? "bg-gradient-to-br from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 text-white"
                                                : "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white";
                                            return (
                                                <Link
                                                    href={`/chessboard?mode=challenge&time=0&fen_challenge=${challenge.fen}&check_moves=${challenge.number_moves}`}
                                                    key={challenge.id}
                                                    className={`${baseClasses} ${isCompleted ? completedClasses : normalClasses}`}
                                                >
                                                    <button>
                                                        {challenge.id}
                                                    </button>
                                                </Link>
                                            );
                                        })}
                                </div>

                                <p className={`mt-8 ${darkMode? 'text-slate-300':'text-green-700 text-sm'}`}>
                                    {t.challengeDisclaimer}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}