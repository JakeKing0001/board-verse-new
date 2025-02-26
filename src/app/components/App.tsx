"use client";

import React from 'react';
import ChessBoard from './ChessBoard';
// import RenderModel from './RenderModel';
// import { Pawn } from './models/Pawn';
import SideBar from './SideBar';

export default function App({ mode, time }: { mode: string, time: number }) {
    return (
        <div className="relative w-full h-screen overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-stone-100 to-green-100 animate-gradient-xy">
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
                <SideBar />
                <ChessBoard mode={mode} time={time} />
            </div>
        </div>
    );
}