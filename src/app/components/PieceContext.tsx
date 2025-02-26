"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

const PieceContext = createContext<{
    activePiece: string | null;
    setActivePiece: (piece: string | null) => void;
    activeClass: string;
    hoverPiece: string | null;
    setHoverPiece: (piece: string | null) => void;
    isWhite: boolean;
    setIsWhite: (value: boolean) => void;
    time : number;
    setTime : (value : number) => void;
    mode : string;
    setMode : (value : string) => void;
    isGameOver : string;
    setIsGameOver : (value : string) => void;
} | null>(null);

export const PieceProvider = ({ children }: { children: ReactNode }) => {

    const [activePiece, setActivePiece] = useState<string | null>(null);

    const [isWhite, setIsWhite] = useState<boolean>(true);

    const [hoverPiece, setHoverPiece] = useState<string | null>(null);

    const [time, setTime] = useState<number>(0);

    const [mode, setMode] = useState<string>('');

    const [isGameOver, setIsGameOver] = useState<string>('');

    const activeClass = 'scale-[1.15] bg-[#ffff33] opacity-50 rounded-full';

    useEffect(() => {
        console.log('Time aggiornato: ', time);
    }, [time]);


    return (
        <PieceContext.Provider value={{ activePiece, setActivePiece, activeClass, isWhite, setIsWhite, hoverPiece, setHoverPiece, time, setTime, mode, setMode, isGameOver, setIsGameOver }}>
            {children}
        </PieceContext.Provider>
    );
};

export const usePieceContext = () => {
    const context = useContext(PieceContext);
    if (!context) {
        throw new Error('usePieceContext deve essere utilizzato all\'interno di un PieceProvider');
    }
    return context;
};
