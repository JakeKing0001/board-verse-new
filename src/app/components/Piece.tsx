'use client';

import React from 'react';
import Image from 'next/image';
import { usePieceContext } from './PieceContext';

interface PieceProps {
    type: string;
}

const pieceMap: Record<string, string> = {
    p: "p", P: "p",
    r: "r", R: "r",
    n: "n", N: "n",
    b: "b", B: "b",
    q: "q", Q: "q",
    k: "k", K: "k"
};

export default function Piece({ type }: PieceProps) {
    const { activePiece, setActivePiece, isWhite, hoverPiece, setHoverPiece } = usePieceContext();

    // Se non c'è pezzo, ritorna uno spazio vuoto
    if (!type) {
        return <div className="w-4/5 h-4/5"></div>;
    }

    const isWhitePiece = type === type.toUpperCase() ? "w" : "b";
    const pieceSymbol = pieceMap[type];

    if (!pieceSymbol) return null; // Se il simbolo non esiste, evita di renderizzare il pezzo

    const pieceId = `piece-${type}`;
    const isActive = activePiece === pieceId;
    const isHover = hoverPiece === pieceId;

    const handleHover = () => {
        setHoverPiece(isHover ? null : pieceId);
    };

    const handleClick = () => {
        setActivePiece(isActive ? null : pieceId);
    };

    return (
        <div
            style={{ backgroundImage: `url(https://www.chess.com/chess-themes/pieces/neo/150/${isWhitePiece}${pieceSymbol}.png)` }}
            className="w-4/5 h-4/5 object-contain user-select-none z-10 transition-transform duration-300"
            onClick={isWhitePiece === "w" === isWhite ? handleClick : undefined}
            onMouseEnter={isWhitePiece === "w" === isWhite ? handleHover : undefined}
        />
    );
}
