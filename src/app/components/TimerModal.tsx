import { TrophyIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { usePieceContext } from './PieceContext';
import clsx from 'clsx';

interface TimerModalProps {
    onTimerComplete: (piece: string) => void;
    isWhite: boolean;
}

/**
 * TimerModal component displays a modal dialog to announce the winner when the timer runs out in a chess game.
 * It features animated confetti, a trophy icon, and a "Try Again" button to reload the game.
 * The appearance (colors, gradients, confetti) adapts based on whether the white or black player wins.
 *
 * @param {TimerModalProps} props - The props for the TimerModal component.
 * @param {boolean} props.isWhite - Indicates if the white player is the winner.
 *
 * @returns {JSX.Element} The rendered TimerModal component.
 *
 * @remarks
 * - Uses context for translations via `usePieceContext`.
 * - Includes animated confetti and border effects.
 * - The modal is centered and styled with Tailwind CSS classes.
 * - The "Try Again" button reloads the page.
 */
const TimerModal: React.FC<TimerModalProps> = ({ isWhite }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const { t } = usePieceContext();

    useEffect(() => {
        setIsVisible(true);
        setTimeout(() => setShowConfetti(true), 300);
    }, []);

    // Colori basati sul vincitore
    const bgGradient = isWhite
        ? 'from-white/60 to-gray-100/40' // Per vittoria del nero (sfondo bianco)
        : 'from-gray-900/60 to-gray-800/40'; // Per vittoria del bianco (sfondo nero)

    const textColor = isWhite
        ? 'text-gray-900' // Per vittoria del nero (testo scuro)
        : 'text-white'; // Per vittoria del bianco (testo chiaro)

    const textColorWithOpacity = isWhite
        ? 'text-gray-900/90'
        : 'text-white/90';

    const accentColor = isWhite
        ? 'from-gray-300 to-gray-400' // Per vittoria del nero (accento grigio chiaro)
        : 'from-gray-600 to-gray-700'; // Per vittoria del bianco (accento grigio scuro)

    const buttonBgColor = isWhite
        ? 'bg-gradient-to-r from-gray-200 to-white hover:from-white hover:to-gray-100'
        : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-700';

    const buttonTextColor = isWhite
        ? 'text-gray-800'
        : 'text-gray-100';

    const borderColor = isWhite
        ? 'border-gray-200'
        : 'border-gray-700';

    const winnerColor = !isWhite ? `${t.white}` : `${t.black}`;

    const textShadowStyle = {
        textShadow: isWhite
            ? '1px 1px 3px rgba(0, 0, 0, 0.2)'
            : '1px 1px 3px rgba(255, 255, 255, 0.2)'
    };

    // Animated confetti dots
    const Confetti = () => {
        return (
            <div className={`absolute inset-0 overflow-hidden pointer-events-none ${showConfetti ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
                {Array.from({ length: 50 }).map((_, i) => {
                    const size = Math.random() * 10 + 5;
                    const left = `${Math.random() * 100}%`;
                    const animationDelay = `${Math.random() * 2}s`;
                    const animationDuration = `${Math.random() * 3 + 2}s`;

                    // Colori dei confetti basati sul vincitore
                    const colors = isWhite
                        ? [
                            'rgb(255, 255, 255)',
                            'rgb(229, 231, 235)',
                            'rgb(209, 213, 219)',
                            'rgb(243, 244, 246)',
                            'rgb(250, 250, 250)'
                        ] // Confetti bianchi/grigi chiari
                        : [
                            'rgb(31, 41, 55)',
                            'rgb(55, 65, 81)',
                            'rgb(75, 85, 99)',
                            'rgb(17, 24, 39)',
                            'rgb(107, 114, 128)'
                        ]; // Confetti neri/grigi scuri

                    const color = colors[Math.floor(Math.random() * colors.length)];

                    return (
                        <div
                            key={i}
                            className="absolute rounded-full animate-fall"
                            style={{
                                width: `${size}px`,
                                height: `${size}px`,
                                left,
                                top: '-5%',
                                backgroundColor: color,
                                animationDelay,
                                animationDuration
                            }}
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <div
            className={clsx(
                'w-[600px] h-[450px] bg-gradient-to-br rounded-xl shadow-xl z-[1000] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 backdrop-blur-lg border overflow-hidden',
                bgGradient,
                borderColor,
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            )}
        >
            {/* Background glow */}
            <div
                className={clsx(
                    'absolute inset-0 bg-gradient-to-br opacity-20 blur-xl',
                    accentColor
                )}
            ></div>

            {/* Animated border */}
            <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div
                    className={clsx(
                        'absolute inset-0 bg-gradient-to-r opacity-30 animate-spin-slow blur-sm',
                        accentColor
                    )}
                ></div>
            </div>

            <Confetti />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <div className="text-center space-y-8 animate-fade-in z-10">
                    {/* Trophy icon */}
                    <div
                        className={clsx(
                            'mx-auto w-24 h-24 mb-2 animate-bounce-slow',
                            textColor
                        )}
                    >
                        <TrophyIcon className='w-full h-full' />
                    </div>

                    <div className={`relative transform transition-transform duration-500`}>
                        <h2
                            className={clsx(
                                'text-6xl font-extrabold tracking-wider uppercase',
                                textColor
                            )}
                            style={textShadowStyle}
                        >
                            {t.time}
                        </h2>
                    </div>

                    <div className="relative">
                        <div
                            className={clsx(
                                'absolute inset-0 bg-gradient-to-r from-transparent to-transparent animate-shimmer',
                                isWhite ? 'via-gray-100/30' : 'via-gray-700/30'
                            )}
                        ></div>
                        <p
                            className={clsx(
                                'text-3xl font-semibold tracking-wide bg-gradient-to-r from-transparent to-transparent p-4 rounded-lg',
                                textColorWithOpacity,
                                isWhite ? 'via-white/40' : 'via-gray-800/40'
                            )}
                        >
                            <span className={clsx('font-bold', textColor)}>
                                {winnerColor}
                            </span> {t.checkMateText}
                        </p>
                    </div>

                    {/* Try Again button */}
                    <button
                        onClick={() => { window.location.reload() }}
                        className={clsx(
                            'mt-8 px-8 py-3 rounded-full font-bold text-lg transform transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2',
                            buttonBgColor,
                            buttonTextColor,
                            isWhite ? 'focus:ring-gray-200' : 'focus:ring-gray-700'
                        )}
                    >
                        {t.tryAgain}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimerModal;