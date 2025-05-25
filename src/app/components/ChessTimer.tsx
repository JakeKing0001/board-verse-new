import React, { useState, useEffect } from 'react';
import { usePieceContext } from './PieceContext';

interface TimeUnitProps {
  value: number;
  label: string;
}

interface ChessTimerProps {
  isWhite: boolean;
  initialTime: number;
  role: 'host' | 'guest' | 'spectator';
}

/**
 * ChessTimer component displays and manages countdown timers for both white and black players in a chess game.
 * 
 * @component
 * @param {ChessTimerProps} props - The properties for the ChessTimer component.
 * @param {boolean} props.isWhite - Indicates if the current player is white.
 * @param {number} props.initialTime - The initial time (in seconds) for each player.
 * @param {'guest' | string} props.role - The role of the user, determines the timer layout.
 * 
 * @returns {JSX.Element} The rendered ChessTimer component, showing both players' timers with visual cues for the active player.
 * 
 * @remarks
 * - Uses `useState` to track remaining time for both players.
 * - Uses `useEffect` to decrement the active player's timer every second.
 * - Calls `setIsGameOver` from context when a player's time reaches zero.
 * - Formats time into days, hours, minutes, and seconds.
 * - Visual appearance and layout adapt based on the user's role and active player.
 */
const ChessTimer: React.FC<ChessTimerProps> = ({ isWhite, initialTime, role }) => {

  const [whiteTime, setWhiteTime] = useState<number>(initialTime);
  const [blackTime, setBlackTime] = useState<number>(initialTime);

  const { t } = usePieceContext();

  const { setIsGameOver } = usePieceContext();

  useEffect(() => {

    let interval: NodeJS.Timeout;

    if (whiteTime > 0 && blackTime > 0) {
      interval = setInterval(() => {
        if (isWhite) {

          setWhiteTime(prev => prev - 1);
        } else {
          setBlackTime(prev => prev - 1);
        }
      }, 1000);
    }

    if (whiteTime === 0) {
      // alert("Nero hai vinto!!!!!!!!");
      setIsGameOver('black');
    } else if (blackTime === 0) {
      // alert("Bianco hai vinto!!!!!!!!");
      setIsGameOver('white');
    }

    return () => clearInterval(interval);
  }, [isWhite, whiteTime, blackTime, setIsGameOver]);

  const TimeUnit: React.FC<TimeUnitProps> = ({ value, label }) => (
    <div className="relative group">
      <div className="bg-opacity-20 bg-gray-500 backdrop-blur-sm px-3 py-2 rounded-lg">
        <div className="text-2xl font-mono font-bold">
          {value.toString().padStart(2, '0')}
        </div>
        <div className="text-xs font-medium text-center opacity-80">
          {label}
        </div>
      </div>
    </div>
  );

  const formatTime = (time: number) => {
    const days = Math.floor(time / (24 * 3600));
    const hours = Math.floor((time % (24 * 3600)) / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return (
      <div className="flex gap-2">
        <TimeUnit value={days} label="d" />
        <TimeUnit value={hours} label="h" />
        <TimeUnit value={minutes} label="m" />
        <TimeUnit value={seconds} label="s" />
      </div>
    );
  };

  return (
    <div className="absolute w-full h-full pointer-events-none flex flex-col items-end justify-center gap-[27rem] sm:gap-12 pr-4 sm:pr-8">
      {role === 'guest' ? (
        <>
          {/* White Timer */}
          <div className={`p-4 rounded-2xl shadow-xl transition-all duration-300 ${isWhite ? 'bg-white/90 ring-2 ring-black/20' : 'bg-white/70'
            }`}>
            <div className="mb-2 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isWhite ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-black font-semibold">{t.white}</span>
            </div>
            <div className="text-black">
              {formatTime(whiteTime)}
            </div>
          </div>
          {/* Black Timer */}
          <div className={`p-4 rounded-2xl shadow-xl transition-all duration-300 ${!isWhite ? 'bg-black/90 ring-2 ring-white/20' : 'bg-black/70'}`}>
            <div className="mb-2 flex items-center gap-2 ">
              <div className={`w-2 h-2 rounded-full ${!isWhite ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-white font-semibold">{t.black}</span>
            </div>
            <div className="text-white">
              {formatTime(blackTime)}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Black Timer */}
          <div className={`p-4 rounded-2xl shadow-xl transition-all duration-300 ${!isWhite ? 'bg-black/90 ring-2 ring-white/20' : 'bg-black/70'} rotate-180 sm:rotate-0`}>
            <div className="mb-2 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${!isWhite ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-white font-semibold">{t.black}</span>
            </div>
            <div className="text-white">
              {formatTime(blackTime)}
            </div>
          </div>
          {/* White Timer */}
          <div className={`p-4 rounded-2xl shadow-xl transition-all duration-300 ${isWhite ? 'bg-white/90 ring-2 ring-black/20' : 'bg-white/70'
            }`}>
            <div className="mb-2 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isWhite ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-black font-semibold">{t.white}</span>
            </div>
            <div className="text-black">
              {formatTime(whiteTime)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChessTimer;