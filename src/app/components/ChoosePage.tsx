"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import RenderModel from '../components/RenderModel';
import { Pawn } from '../components/models/Pawn';
import NavBar from '../components/NavBar';
import { usePieceContext } from '../components/PieceContext';

export default function TablePage() {

    const { mode, setMode } = usePieceContext();

    useEffect(() => {
        // console.log('Mode aggiornato: ', mode);
    }, [mode]);

    return (
        <div className="h-screen overflow-hidden">
            <div className='sticky top-0 z-50'>
                <NavBar current={1} />
            </div>
            <div className="h-[calc(100vh-5rem)] bg-transparent z-40 flex items-center justify-center relative">
                <RenderModel gradientClassName='absolute inset-0 bg-gradient-to-br from-green-200 to-amber-100'>
                    <Pawn position={[-3, 0, -2]} />
                    <Pawn position={[3, 0, -2]} />
                    <Pawn position={[-3, 0, 2]} />
                    <Pawn position={[3, 0, 2]} />
                    <Pawn position={[-3, 0, 0]} />
                    <Pawn position={[3, 0, 0]} />
                </RenderModel>
                <div className="relative z-10 bg-white/20 backdrop-blur-lg rounded-xl p-8 shadow-2xl">
                    <h1 className="text-4xl font-bold text-green-800 text-center mb-8">
                        Select Game Mode
                    </h1>
                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                        <Link href="/chooseTime" className="w-full">
                            <button className="w-full bg-green-400 hover:bg-green-500 text-green-900 font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl" onClick={() => setMode('multiplayer')}>
                                Multiplayer
                            </button>
                        </Link>
                        <Link href="/chooseTime" className="w-full">
                            <button className="w-full bg-amber-200 hover:bg-amber-300 text-green-900 font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl" onClick={() => setMode('ai')}>
                                AI
                            </button>
                        </Link>
                        <Link href="/chooseTime" className="w-full">
                            <button className="w-full bg-green-400 hover:bg-green-500 text-green-900 font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl" onClick={() => setMode('online')}>
                                Online
                            </button>
                        </Link>
                        <Link href="/chooseTime" className="w-full">
                            <button className="w-full bg-amber-200 hover:bg-amber-300 text-green-900 font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl" onClick={() => setMode('challenge')}>
                                Challenge
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}