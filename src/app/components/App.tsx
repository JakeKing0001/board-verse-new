import React from 'react';
import ChessBoard from './ChessBoard';
import { usePieceContext } from './PieceContext';

/**
 * Main application component that renders the chess board and background gradient.
*
* @param props - The properties for the App component.
* @param props.mode - The game mode (e.g., "classic", "challenge").
* @param props.time - The time control for the game in seconds.
* @param props.fen_challenge - The FEN string representing the challenge position.
* @param props.check_moves - The number of moves to check for the challenge.
* @param props.gameData - Optional additional data for the game.
* @returns The rendered App component with background and chess board.
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function App({ mode, time, fen_challenge, check_moves, gameData }: { mode: string, time: number, fen_challenge: string, check_moves: number, gameData?: any }) {

    const { darkMode } = usePieceContext();

    return (
        <div className="bv-page relative min-h-screen w-full overflow-x-hidden">
            <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${
                    darkMode
                        ? 'from-slate-950 via-[#111d2d] to-emerald-950'
                        : 'from-emerald-50 via-stone-50 to-amber-100'
                }`}
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className={`absolute -left-24 top-1/4 h-80 w-80 rounded-full blur-3xl ${
                    darkMode ? 'bg-violet-500/10' : 'bg-emerald-300/25'
                }`} />
                <div className={`absolute -right-24 top-16 h-96 w-96 rounded-full blur-3xl ${
                    darkMode ? 'bg-emerald-500/10' : 'bg-amber-300/25'
                }`} />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.045)_1px,transparent_1px)] bg-[size:38px_38px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
            </div>
            <div className="relative z-10">
                <ChessBoard mode={mode} time={time} fen_challenge={fen_challenge} check_moves={check_moves} gameData={gameData} />
            </div>
        </div>
    );
}
