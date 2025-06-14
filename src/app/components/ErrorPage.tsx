import React, { useState, useEffect } from 'react';

export default function MiniChess404() {
    const [hoveredPiece, setHoveredPiece] = useState<number | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const pieces = [
        { piece: '♔', pos: 28, color: 'white' }, // e4
        { piece: '♕', pos: 27, color: 'white' }, // d4
        { piece: '♚', pos: 35, color: 'black' }, // e5
        { piece: '♛', pos: 36, color: 'black' }  // f5

    ];

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 30,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full filter blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
            </div>
            <div className="text-center relative z-10">
                {/* Floating 404 */}
                <div className="relative mb-4">
                    <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 drop-shadow-2xl animate-pulse">
                        404
                    </h1>
                    <div className="absolute inset-0 text-7xl font-black text-white/10 transform translate-x-1 translate-y-1">
                        404
                    </div>
                </div>
                {/* 3D Chess Board */}
                <div 
                    className="inline-block mb-8 relative transition-transform duration-300 ease-out"
                    style={{
                        transform: `perspective(800px) rotateX(${25 + mousePosition.y * 0.3}deg) rotateY(${-10 + mousePosition.x * 0.5}deg)`,
                        transformStyle: 'preserve-3d'
                    }}
                >
                    {/* Board Shadow */}
                    <div className="absolute inset-0 bg-black/40 blur-xl transform translate-y-6 translate-x-4 scale-110 rounded-xl"></div>
                    
                    {/* Board Frame */}
                    <div className="relative p-6 bg-gradient-to-br from-amber-200 via-amber-100 to-amber-300 rounded-xl shadow-2xl border-4 border-amber-900/30">
                        <div className="grid grid-cols-8 gap-0 w-64 h-64 rounded-lg overflow-hidden shadow-inner border-2 border-amber-800/20">
                            {Array.from({ length: 64 }, (_, i) => {
                                const isLight = (Math.floor(i / 8) + i) % 2 === 0;
                                const piece = pieces.find(p => p.pos === i);
                                
                                return (
                                    <div
                                        key={i}
                                        className={`w-8 h-8 flex items-center justify-center text-2xl cursor-pointer transition-all duration-300 relative ${
                                            isLight 
                                                ? 'bg-gradient-to-br from-amber-50 via-cream-100 to-amber-100 hover:from-amber-100 hover:to-amber-200' 
                                                : 'bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 hover:from-amber-700 hover:to-amber-800'
                                        } ${hoveredPiece === i ? 'scale-110 z-10 shadow-lg' : ''}`}
                                        style={{
                                            boxShadow: isLight 
                                                ? 'inset 2px 2px 4px rgba(0,0,0,0.1), inset -2px -2px 4px rgba(255,255,255,0.3)'
                                                : 'inset 2px 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(139,69,19,0.2)'
                                        }}
                                        onMouseEnter={() => piece && setHoveredPiece(i)}
                                        onMouseLeave={() => setHoveredPiece(null)}
                                    >
                                        {piece && (
                                            <span 
                                                className={`${
                                                    piece.color === 'white' 
                                                        ? 'text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]' 
                                                        : 'text-gray-900 drop-shadow-[1px_1px_2px_rgba(255,255,255,0.3)]'
                                                } ${hoveredPiece === i ? 'animate-pulse scale-125' : ''} transition-all duration-300`}
                                                style={{
                                                    textShadow: piece.color === 'white' 
                                                        ? '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(255,255,255,0.3)'
                                                        : '1px 1px 2px rgba(255,255,255,0.3), 0 0 4px rgba(0,0,0,0.2)'
                                                }}
                                            >
                                                {piece.piece}
                                            </span>
                                        )}
                                        {hoveredPiece === i && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 animate-pulse rounded"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Board edges for 3D effect */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-300/50 to-amber-700/50 pointer-events-none"
                             style={{
                                 background: 'linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(180,83,9,0.6) 100%)',
                                 transform: 'translateZ(-10px)'
                             }}
                        ></div>
                    </div>
                </div>

                {/* Content */}
                <div className="mt-8 backdrop-blur-lg bg-white/10 rounded-2xl p-8 shadow-xl border border-white/20 max-w-md mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-4">Mossa Non Valida</h2>
                    <p className="text-gray-300 mb-8 leading-relaxed">
                        La posizione richiesta non esiste sulla scacchiera. Riprova con una mossa valida.
                    </p>
                    
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-xl hover:shadow-amber-500/25 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                            Torna alla Base
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}