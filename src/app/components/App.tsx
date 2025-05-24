import React from 'react';
import ChessBoard from './ChessBoard';
import { usePieceContext } from './PieceContext';
// import RenderModel from './RenderModel';
// import { Pawn } from './models/Pawn';

export default function App({ mode, time, fen_challenge, check_moves, gameData }: { mode: string, time: number, fen_challenge: string, check_moves: number, gameData?: any }) {

    const { darkMode} = usePieceContext();

    return (
        <div className="relative w-full h-screen overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${darkMode? 'from-slate-800 via-slate-400 to-slate-800':'from-green-100 via-stone-100 to-green-100'} animate-gradient-xy`}>
                {/* <RenderModel gradientClassName='canvas-gradient'>
                    <Pawn position={[-6, 0, -4]} />
                    <Pawn position={[6, 0, -4]} />
                    <Pawn position={[-6, 0, 4]} />
                    <Pawn position={[6, 0, 4]} />
                    <Pawn position={[-6, 0, 0]} />
                    <Pawn position={[6, 0, 0]} />
                </RenderModel> */}
            </div>
            <div className="relative z-10">
                <ChessBoard mode={mode} time={time} fen_challenge={fen_challenge} check_moves={check_moves} gameData={gameData} />
            </div>
        </div>
    );
}