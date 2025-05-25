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

    const { darkMode} = usePieceContext();

    return (
        <div className="relative w-full h-screen overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${darkMode? 'from-slate-800 via-slate-400 to-slate-800':'from-green-100 via-stone-100 to-green-100'} animate-gradient-xy`}>
            </div>
            <div className="relative z-10">
                <ChessBoard mode={mode} time={time} fen_challenge={fen_challenge} check_moves={check_moves} gameData={gameData} />
            </div>
        </div>
    );
}