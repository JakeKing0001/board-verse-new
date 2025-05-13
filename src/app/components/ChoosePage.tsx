"use client";

import React from 'react';
import Link from 'next/link';
import RenderModel from '../components/RenderModel';
import { Pawn } from '../components/models/Pawn';
import NavBar from '../components/NavBar';
import { usePieceContext } from '../components/PieceContext';

export default function TablePage() {

    const { setMode, t, darkMode } = usePieceContext();

    return (
        <div className="h-screen overflow-hidden">
            <div className='sticky top-0 z-50'>
                <NavBar current={1} />
            </div>
            <div className="h-[calc(100vh-5rem)] bg-transparent z-40 flex items-center justify-center relative">
                <RenderModel gradientClassName={`absolute inset-0 bg-gradient-to-br ${darkMode? 'from-slate-900 to-slate-600':'from-green-200 to-amber-100'}`}>
                    <Pawn position={[-3, 0, -2]} />
                    <Pawn position={[3, 0, -2]} />
                    <Pawn position={[-3, 0, 2]} />
                    <Pawn position={[3, 0, 2]} />
                    <Pawn position={[-3, 0, 0]} />
                    <Pawn position={[3, 0, 0]} />
                </RenderModel>
                <div className={`relative z-10 bg-white/20 backdrop-blur-lg rounded-xl p-8 shadow-2xl`}>
                    <h1 className={`text-4xl font-bold ${darkMode? 'text-white':'text-green-800'} text-center mb-8`}>
                        {t.chooseMode}
                    </h1>
                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                        <Link href="/chooseTime" className="w-full">
                            <button className={`w-full ${darkMode? 'bg-slate-800 hover:bg-slate-900 text-white':'bg-green-400 hover:bg-green-500 text-green-900'} font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl`} onClick={() => setMode('multiplayer')}>
                                {t.multiplayer}
                            </button>
                        </Link>
                        <Link href="/chooseTime" className="w-full">
                            <button className={`w-full ${darkMode? 'bg-slate-50 hover:bg-slate-200 text-slate-900':'bg-amber-400 hover:bg-amber-500 text-amber-900'} font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl`} onClick={() => setMode('ai')}>
                                {t.ai}
                            </button>
                        </Link>
                        <Link href="/online" className="w-full">
                            <button className={`w-full ${darkMode? 'bg-slate-50 hover:bg-slate-200 text-slate-900':'bg-amber-400 hover:bg-amber-500 text-amber-900'} font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl`} onClick={() => setMode('online')}>
                                {t.online}
                            </button>
                        </Link>
                        <Link href="/challenge" className="w-full">
                            <button className={`w-full ${darkMode? 'bg-slate-800 hover:bg-slate-900 text-white':'bg-green-400 hover:bg-green-500 text-green-900'} font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl`} onClick={() => setMode('challenge')}>
                                {t.challenge}
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}