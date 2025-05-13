import React from 'react';
import { usePieceContext } from './PieceContext';
import { showPiece } from '../pieceLogic';

interface PieceProps {
    type: string;
    id : string;
}

const pieceMap: Record<string, string> = {
    p: "p", P: "p",
    r: "r", R: "r",
    n: "n", N: "n",
    b: "b", B: "b",
    q: "q", Q: "q",
    k: "k", K: "k"
};

export default function Piece({ type, id }: PieceProps) {
    const { activePiece, setActivePiece, isWhite, hoverPiece, setHoverPiece, setSelectedPiece, setsubMovesDrag } = usePieceContext();

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

    function handleDragStart(event: React.DragEvent, pieceId: string) {
        event.dataTransfer.setData("text/plain", pieceId);
        setSelectedPiece(pieceId);
        const subMovesDrag = showPiece(pieceId, isWhite, null);
        
        setsubMovesDrag(subMovesDrag.toString());
    }


    /* eslint-disable @typescript-eslint/no-unused-vars */
    return (
        <img
            src={`https://www.chess.com/chess-themes/pieces/neo/150/${isWhitePiece}${pieceSymbol}.png`}
            alt='piece'
            className={`w-4/5 h-4/5 object-contain user-select-none z-10 transition-transform duration-300 
            ${isActive ? 'transition-all' : 'transition-all'}`}
            onClick={isWhitePiece === "w" === isWhite ? handleClick : undefined}
            onMouseEnter={isWhitePiece === "w" === isWhite ? handleHover : undefined}
            draggable={true}
            // onDragStart={(e) => handleDragStart(e, id)}
            style={{ cursor: "grab" }}
            onContextMenu={(e) => { e.preventDefault(); }}
        />
    );
    /* eslint-enable @typescript-eslint/no-unused-vars */
}
