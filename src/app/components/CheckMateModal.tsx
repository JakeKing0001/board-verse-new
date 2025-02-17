import React, { useEffect, useState } from 'react';
import { usePieceContext } from './PieceContext';
import RenderModel from './RenderModel';
import { Trophy } from './models/Trophy';
import { X } from 'lucide-react';

interface CheckMateModalProps {
    onCheckMateComplete: (piece: string) => void;
}

const CheckMateModal: React.FC<CheckMateModalProps> = ({ onCheckMateComplete }) => {
    const [isVisible, setIsVisible] = useState(false);
    const { isWhite } = usePieceContext();

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const textColor = !isWhite ? 'text-white' : 'text-black';
    const textColorWithOpacity = !isWhite ? 'text-white/90' : 'text-black/90';

    const textShadowStyle = {
        textShadow: !isWhite 
            ? '2px 2px 4px rgba(0, 0, 0, 0.7), -2px -2px 4px rgba(0, 0, 0, 0.7), 2px -2px 4px rgba(0, 0, 0, 0.7), -2px 2px 4px rgba(0, 0, 0, 0.7)'
            : '2px 2px 4px rgba(255, 255, 255, 0.7), -2px -2px 4px rgba(255, 255, 255, 0.7), 2px -2px 4px rgba(255, 255, 255, 0.7), -2px 2px 4px rgba(255, 255, 255, 0.7)'
    };

    return (
        <div
            className={`w-[600px] h-[400px] bg-gradient-to-br from-white/40 to-white/20 rounded-xl shadow-2xl z-[1000] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 backdrop-blur-sm border border-white/20 overflow-hidden ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
        >
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(() => onCheckMateComplete(''), 700);
                }}
                className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
            >
                <X className={`w-6 h-6 ${textColor}`} />
            </button>

            <div className="absolute inset-0">
                <RenderModel 
                    className="w-full h-full"
                    gradientClassName="h-full"
                >
                    <Trophy />
                </RenderModel>
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <div className="text-center space-y-6 animate-fade-in">
                    <div className={`relative transform transition-transform duration-500 hover:scale-105`}>
                        <h2
                            className={`text-7xl font-extrabold ${textColor} tracking-wider uppercase`}
                            style={{
                                textShadow: '0 0 15px rgba(255,255,255,0.3)'
                            }}
                        >
                            Check Mate!
                        </h2>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                        <p
                            className={`text-3xl ${textColorWithOpacity} font-semibold tracking-wide
                            bg-gradient-to-r from-transparent via-white/20 to-transparent p-4 rounded-lg
                            transform transition-all duration-300 hover:scale-105`}
                            style={textShadowStyle}
                        >
                            {!isWhite ? 'White' : 'Black'} Wins!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckMateModal;