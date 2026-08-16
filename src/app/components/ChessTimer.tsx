import React, { useEffect, useState } from 'react';
import { usePieceContext } from './PieceContext';

interface ChessTimerProps {
  isWhite: boolean;
  initialTime: number;
  role: 'host' | 'guest' | 'spectator';
  immersive?: boolean;
}

const formatClock = (time: number) => {
  const safeTime = Math.max(0, time);
  const days = Math.floor(safeTime / 86_400);
  const hours = Math.floor((safeTime % 86_400) / 3_600);
  const minutes = Math.floor((safeTime % 3_600) / 60);
  const seconds = safeTime % 60;

  if (days > 0) return `${days}g ${String(hours).padStart(2, '0')}h`;
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

function TimerCard({
  label,
  color,
  value,
  active,
}: {
  label: string;
  color: 'white' | 'black';
  value: number;
  active: boolean;
}) {
  const isBlackCard = color === 'black';
  return (
    <div
      className={`pointer-events-auto min-w-[8.5rem] rounded-2xl border p-3 shadow-xl transition sm:min-w-[10rem] sm:p-4 ${
        isBlackCard
          ? 'border-white/10 bg-slate-950/90 text-white'
          : 'border-white/80 bg-white/80 text-slate-950'
      } ${active ? 'ring-2 ring-emerald-400/75 shadow-emerald-500/15' : 'opacity-80'}`}
    >
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em]">
        <span className={`h-2 w-2 rounded-full ${active ? 'animate-pulse bg-emerald-400' : 'bg-slate-400'}`} />
        {label}
      </div>
      <time className="mt-1.5 block font-mono text-xl font-black tabular-nums sm:text-2xl">
        {formatClock(value)}
      </time>
    </div>
  );
}

const ChessTimer: React.FC<ChessTimerProps> = ({ isWhite, initialTime, role, immersive = false }) => {
  const [whiteTime, setWhiteTime] = useState(initialTime);
  const [blackTime, setBlackTime] = useState(initialTime);
  const { t, setIsGameOver } = usePieceContext();

  useEffect(() => {
    if (whiteTime === 0) {
      setIsGameOver('black');
      return;
    }
    if (blackTime === 0) {
      setIsGameOver('white');
      return;
    }

    const interval = window.setInterval(() => {
      if (isWhite) {
        setWhiteTime((previous) => Math.max(0, previous - 1));
      } else {
        setBlackTime((previous) => Math.max(0, previous - 1));
      }
    }, 1_000);

    return () => window.clearInterval(interval);
  }, [blackTime, isWhite, setIsGameOver, whiteTime]);

  const blackTimer = <TimerCard label={t.black} color="black" value={blackTime} active={!isWhite} />;
  const whiteTimer = <TimerCard label={t.white} color="white" value={whiteTime} active={isWhite} />;
  const orderedTimers = role === 'guest'
    ? [<React.Fragment key="white">{whiteTimer}</React.Fragment>, <React.Fragment key="black">{blackTimer}</React.Fragment>]
    : [<React.Fragment key="black">{blackTimer}</React.Fragment>, <React.Fragment key="white">{whiteTimer}</React.Fragment>];

  return (
    <div className={immersive
      ? 'board-3d-timers'
      : 'pointer-events-none fixed inset-x-2 bottom-2 z-40 flex items-end justify-between gap-2 sm:absolute sm:inset-y-0 sm:left-auto sm:right-4 sm:flex-col sm:justify-center sm:gap-8 lg:right-8'}>
      {orderedTimers}
    </div>
  );
};

export default ChessTimer;
