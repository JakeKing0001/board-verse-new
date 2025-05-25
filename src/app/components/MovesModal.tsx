import React, { useEffect, useState } from 'react';
import { usePieceContext } from './PieceContext';

interface MovesModalProps {
    onMovesComplete: (piece: string) => void;
}

/**
 * A modal component that displays a checkmate (loss) message to the user.
 *
 * This modal appears with a fade-in and scale animation when mounted, showing a prominent
 * "You Lose" message, a description, and a button to play again. When the button is clicked,
 * the modal fades out and the page reloads after a short delay.
 *
 * @component
 * @param {MovesModalProps} props - The props for the modal component.
 * @param {(result: string) => void} props.onMovesComplete - Callback invoked when the user completes the moves (e.g., clicks "Play Again").
 *
 * @returns {JSX.Element} The rendered checkmate modal.
 */
const CheckMateModal: React.FC<MovesModalProps> = ({ onMovesComplete }) => {
    const [isVisible, setIsVisible] = useState(false);

    const { t } = usePieceContext();

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div
            className={`w-[600px] h-[400px] bg-gradient-to-br from-white/40 to-white/20 rounded-xl shadow-2xl z-[1000] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 backdrop-blur-sm border border-white/20 overflow-hidden ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}
        >

            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <div className="text-center space-y-6 animate-pulse">
                    <div className="relative transform transition-transform duration-500 hover:scale-105">
                        <h2
                            className="text-7xl font-extrabold text-red-600 tracking-wider uppercase"
                            style={{
                                textShadow: '0 2px 10px rgba(220,38,38,0.4), 0 0 30px rgba(255,255,255,0.2)'
                            }}
                        >
                            {t.youLose}
                        </h2>
                    </div>

                    <p className="text-xl text-red-500 font-medium mt-4">
                        {t.checkMateLoseDescription}
                    </p>

                    <div className="mt-8">
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                setTimeout(() => onMovesComplete(''), 700);
                                window.location.reload();
                            }}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
                        >
                            {t.playAgain}
                        </button>
                    </div>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-600/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-600/10 rounded-full blur-xl"></div>
        </div>
    );
};

export default CheckMateModal;