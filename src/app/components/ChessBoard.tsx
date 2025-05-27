import React, { useState, useEffect, JSX } from 'react';
import Piece from './Piece';
import { movePiece, showPiece, getEnpassant, getWhiteCastling, getBlackCastling, setWhiteCastling, setBlackCastling } from '../pieceLogic';
import { usePieceContext } from './PieceContext';
import PromotionModal from './PromotionModal';
import CheckMateModal from './CheckMateModal';
import { getCheck } from '../checkMateLogic';
import { fetchStockfishData } from '../stockFishUtils';
import ChessTimer from './ChessTimer';
import TimerModal from './TimerModal';
import Sidebar from './SideBar';
import ChessMoves from './ChessMoves';
import MovesModal from './MovesModal';
import { setChallengeComplete } from '../../../services/challengeComplete';
import { supabase } from '../../../lib/supabase';
import { useSearchParams } from 'next/navigation';

// Sopprimi silenziosamente i NotFoundError generati da React quando prova a rimuovere un nodo già rimosso
if (typeof window !== 'undefined') {
    const nativeRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
        try {
            return nativeRemoveChild.call(this, child) as T;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            if (err.name === 'NotFoundError') {
                // qui semplicemente ignoro l'errore
                return child;
            }
            // per qualsiasi altro errore, rilancio
            throw err;
        }
    };
}

const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
const numbers = [8, 7, 6, 5, 4, 3, 2, 1];
const squaress: JSX.Element[] = [];
let fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; let empty = 0; let enPassant = '';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let actualMove: string;
let done = false;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let subMoves: NodeListOf<HTMLDivElement>, moves: HTMLDivElement[];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let bestmove: string;

export function getSquares() {
    return [...new Set(squaress)];
}

export function getLetters() {
    return letters;
}

function parseFEN(fen: string): string[][] {
    const rows = fen.split(" ")[0].split("/");
    const board: string[][] = [];

    for (const row of rows) {
        const boardRow: string[] = [];
        for (const char of row) {
            if (!isNaN(Number(char))) {
                boardRow.push(...Array(Number(char)).fill(""));
            } else {
                boardRow.push(char);
            }
        }
        board.push(boardRow);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return board;
}

/**
 * Renders the main ChessBoard component, supporting multiple game modes (online, AI, challenge).
 * Handles board state, move logic, check/checkmate detection, promotion, castling, and UI effects.
 * Integrates with Supabase for real-time online play and move synchronization.
 * 
 * @param props - Component props
 * @param props.mode - The game mode ('online', 'ai', 'challenge', etc.)
 * @param props.time - Initial time for the chess timer (in seconds)
 * @param props.fen_challenge - Optional FEN string for challenge mode starting position
 * @param props.check_moves - Optional number of moves to check in challenge mode
 * @param props.gameData - Optional game data object (used in online mode)
 * 
 * @returns The rendered ChessBoard component with all interactive chess features and modals.
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ChessBoard({ mode, time, fen_challenge, check_moves, gameData }: { mode: string, time: number, fen_challenge?: string, check_moves?: number, gameData?: any }) {

    const [isInCheck, setIsInCheck] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [movesList, setMovesList] = useState<any[]>([]);
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId') || '';
    const { isGameOver, selectedPiece, setSelectedPiece, user, allUsers, challenges, darkMode } = usePieceContext();

    const hostUser = allUsers.find((u) => u.id === gameData?.host_id);
    const guestUser = allUsers.find((u) => u.id === gameData?.guest_id);

    useEffect(() => {
        const style = document.getElementById("check-border-style");
        if (style && style.parentNode) {
            try {
                style.parentNode.removeChild(style);
            } catch (err) {
                // Se lo style non è più figlio, ignoro l’errore
                console.warn("check-border-style già rimosso:", err);
            }
        }
    }, []);

    useEffect(() => {
        if (mode === 'online' && gameId) {
            console.log('🚀 Inizializzo realtime per gameId:', gameId);
            const channel = supabase
                .channel('game-moves-listen')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'game_moves',
                        filter: `game_id=eq.${gameId}`
                    },
                    (payload) => {
                        // payload è un oggetto { old, new, ... }
                        console.log("⏱️ real-time payload:", payload.new)
                        const gm = payload.new

                        setMovesList(prev => {
                            // 1) aggiorno la lista
                            const updated = [...prev, gm]
                            // 2) salvo l’ultima mossa per evidenziare
                            setLastMove(gm.from_sq + gm.to_sq)
                            return updated
                        })
                    }
                )
                .subscribe()

            // Carica le mosse esistenti all'avvio
            supabase
                .from('game_moves')
                .select('*')
                .eq('game_id', gameId)
                .order('created_at', { ascending: true })
                .then(({ data }) => setMovesList(data || []));

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [mode, gameId]);

    interface StockfishData {
        bestMove: string;
        [key: string]: string;
    }

    const squares: JSX.Element[] = [];

    const [lastMove, setLastMove] = useState<string | null>(null);

    const isEnPassant = true;

    useEffect(() => {
        getEnpassant(isEnPassant);
    }, [isEnPassant]);

    const initialFEN = (fen_challenge && mode === 'challenge') ? fen_challenge : fen;
    const [fenState] = useState(initialFEN);
    const [board, setBoard] = useState<string[][]>(parseFEN(initialFEN));
    const [isWhite, setIsWhite] = useState(initialFEN.split(" ")[1] === "w");
    const [showPromotionDiv, setShowPromotionDiv] = useState(false);
    const [promotionResolved, setPromotionResolved] = useState<((value: string) => void) | null>(null);
    const [data, setData] = useState<StockfishData | null>(null);
    const [showCheckMateDiv, setShowCheckMateDiv] = useState(false);
    const [showTimerDiv, setTimerDiv] = useState(false);
    const [showMovesDiv, setShowMovesDiv] = useState(false);
    const [checkMoves, setCheckMoves] = useState<number | undefined>(check_moves);

    const [shouldRotate, setShouldRotate] = useState(false);

    useEffect(() => {
        if (isGameOver !== '') {
            setTimerDiv(true);
        }
    }, [isGameOver]);

    // Add effect for check border animation and scared king
    useEffect(() => {
        // Create and append the check border element if it doesn't exist
        if (!document.getElementById('check-border-effect')) {
            const borderElement = document.createElement('div');
            borderElement.id = 'check-border-effect';
            borderElement.style.position = 'fixed';
            borderElement.style.top = '0';
            borderElement.style.left = '0';
            borderElement.style.right = '0';
            borderElement.style.bottom = '0';
            borderElement.style.pointerEvents = 'none';
            borderElement.style.zIndex = '9999';
            borderElement.style.transition = 'all 0.3s ease';
            document.body.appendChild(borderElement);

            // Add enhanced animations with CSS
            const style = document.createElement('style');
            style.id = 'check-border-style';
            style.textContent = `
            @keyframes check-effect {
                0% { 
                    box-shadow: inset 0 0 20px 5px rgba(255, 0, 0, 0.7),
                                0 0 20px 10px rgba(255, 0, 0, 0.5);
                    background: radial-gradient(circle, rgba(255,0,0,0.1) 0%, rgba(255,0,0,0) 70%);
                }
                50% { 
                    box-shadow: inset 0 0 35px 10px rgba(255, 0, 0, 0.5),
                                0 0 30px 15px rgba(255, 0, 0, 0.3);
                    background: radial-gradient(circle, rgba(255,0,0,0.15) 0%, rgba(255,0,0,0) 60%);
                }
                100% { 
                    box-shadow: inset 0 0 20px 5px rgba(255, 0, 0, 0.7),
                                0 0 20px 10px rgba(255, 0, 0, 0.5);
                    background: radial-gradient(circle, rgba(255,0,0,0.1) 0%, rgba(255,0,0,0) 70%);
                }
            }
            
            @keyframes heartbeat {
                0% { transform: scale(1); }
                14% { transform: scale(1.05); }
                28% { transform: scale(1); }
                42% { transform: scale(1.08); }
                70% { transform: scale(1); }
                100% { transform: scale(1); }
            }
            
            @keyframes scared-king {
                0%, 100% { transform: translate(0, 0) rotate(0); }
                10% { transform: translate(-1px, -1px) rotate(-1deg); }
                20% { transform: translate(1px, -1px) rotate(1deg); }
                30% { transform: translate(-1px, 1px) rotate(-1deg); }
                40% { transform: translate(1px, 1px) rotate(1deg); }
                50% { transform: translate(-1px, -1px) rotate(-1deg); }
                60% { transform: translate(1px, -1px) rotate(1deg); }
                70% { transform: translate(-1px, 1px) rotate(-1deg); }
                80% { transform: translate(1px, 1px) rotate(1deg); }
                90% { transform: translate(-1px, 0) rotate(-1deg); }
            }
            
            .check-active {
                animation: check-effect 2s infinite, heartbeat 1.5s infinite;
                backdrop-filter: contrast(1.05) saturate(1.1);
            }
            
            .scared-king {
                animation: scared-king 0.5s infinite;
                filter: drop-shadow(0 0 3px red);
            }
        `;
            document.head.appendChild(style);
        }

        // Toggle the border effect based on check state
        const borderElement = document.getElementById('check-border-effect');
        if (borderElement) {
            if (isInCheck) {
                borderElement.classList.add('check-active');

                // Add dramatic audio cue for check (optional)
                if (!document.getElementById('check-sound')) {
                    const sound = document.createElement('audio');
                    sound.id = 'check-sound';
                    sound.src = 'https://www.chess.com/sounds/move-check';
                    sound.volume = 0.4;
                    document.body.appendChild(sound);
                    sound.play().catch(e => console.log("Audio play prevented:", e));
                } else {
                    const sound = document.getElementById('check-sound') as HTMLAudioElement;
                    sound.currentTime = 0;
                    sound.play().catch(e => console.log("Audio play prevented:", e));
                }

                // Find the king that is in check and make it look scared
                const kingColor = isWhite ? 'w' : 'b';

                // Look through all squares to find the king of the current player's color
                for (let i = 0; i < letters.length; i++) {
                    for (let j = 0; j < numbers.length; j++) {
                        const squareId = `${letters[i]}${numbers[j]}`;
                        const square = document.getElementById(squareId);

                        if (square && square.children.length > 0) {
                            const piece = square.children[0] as HTMLElement;
                            const srcAttr = piece.getAttribute('src');

                            // Check if this is the king of the current player
                            if (srcAttr && srcAttr.includes(`${kingColor}k`)) {
                                // Add scared animation to the king
                                piece.classList.add('scared-king');
                                break;
                            }
                        }
                    }
                }
            } else {
                borderElement.classList.remove('check-active');

                // Remove scared effect from any pieces
                const scaredPieces = document.querySelectorAll('.scared-king');
                scaredPieces.forEach(piece => {
                    piece.classList.remove('scared-king');
                });
            }
        }
    }, [isInCheck, isWhite]);

    // useEffect per gestire l'aggiunta della classe quando selectedPiece cambia
    useEffect(() => {
        const updatePiece = () => {
            const previousPiece = document.querySelector('.bg-yellow-200');
            if (previousPiece) {
                previousPiece.classList.remove('bg-yellow-200', 'rounded-full');
                const subChoosedPiece = document.querySelectorAll('.bg-gray-400\\/75');
                const capturedPiece = document.querySelectorAll('.bg-red-400\\/75');
                const enPassantPiece = document.querySelectorAll('.bg-blue-400\\/75');
                const castlingPiece = document.querySelectorAll('.bg-purple-400\\/75');
                if (subChoosedPiece) {
                    subChoosedPiece.forEach((piece) => {
                        piece.classList.remove('bg-gray-400/75', 'scale-[0.50]', 'rounded-full');
                    });
                }
                if (capturedPiece) {
                    capturedPiece.forEach((piece) => {
                        piece.classList.remove('bg-red-400/75', 'rounded-full', 'scale-[0.50]');
                    });
                }
                if (enPassantPiece) {
                    enPassantPiece.forEach((piece) => {
                        piece.classList.remove('bg-blue-400/75', 'rounded-full', 'scale-[0.50]');
                    });
                }
                if (castlingPiece) {
                    castlingPiece.forEach((piece) => {
                        piece.classList.remove('bg-purple-400/75', 'rounded-full', 'scale-[0.50]');
                    });
                }
            }


            if (selectedPiece) {
                const currentPiece = document.getElementById(selectedPiece);
                if (currentPiece) {
                    currentPiece.classList.add('bg-yellow-200', 'rounded-full');
                } else {
                    console.error(`Div con id="${selectedPiece}" non trovato`);
                }
            }
        };

        updatePiece();
    }, [selectedPiece]);

    //-----------------------------------------------------------------------------
    useEffect(() => {
        if (mode === "online" && gameId) {
            supabase
                .from("games")
                .select("*")
                .eq("id", gameId)
                .single()
                .then(({ data }) => data);
            // Puoi anche aggiungere un listener realtime per aggiornare lo stato
        }
    }, [mode, gameId]);

    useEffect(() => {
        if (mode !== 'online') return;

        // 1) Pulisci tutte le evidenziazioni precedenti
        document.querySelectorAll('[class*="bg-"]').forEach(el => {
            el.classList.remove(
                'bg-gray-400/75', 'bg-red-400/75', 'bg-blue-400/75', 'bg-purple-400/75'
            );
            (el as HTMLElement).style.pointerEvents = 'auto';
        });

        // 2) Ricostruisci la board dal FEN in stato
        const newBoard = applyMovesToBoard(fenState, movesList);
        setBoard(newBoard);

        // 3) Alterna subito il turno
        const nextIsWhite = movesList.length % 2 === 0;
        setIsWhite(nextIsWhite);

        //4) check & checkmate
        //    chi ha la mossa è nextIsWhite? vero=bianco, falso=nero
        if (getCheck(nextIsWhite)) {
            let legal = 0;
            // scorro la matrice per trovare tutti i pezzi del colore a mossa
            newBoard.forEach((row, i) =>
                row.forEach((cell, j) => {
                    if (cell) {
                        const isOwn = nextIsWhite
                            ? cell === cell.toUpperCase()
                            : cell === cell.toLowerCase();
                        if (isOwn) {
                            const sq = `${letters[j]}${numbers[i]}`;
                            legal += showPiece(sq, nextIsWhite, lastMove).length;
                        }
                    }
                })
            );
            if (legal === 0) {
                setShowCheckMateDiv(true);
            }
        }

        // 4) (Opzionale) Se vuoi mostrare mosse possibili all’inizio del turno
        //    fallo **solo** per il pezzo selezionato, non per tutti i pezzi.
        if (selectedPiece) {
            const moves = showPiece(selectedPiece, isWhite, lastMove);
            disableOtherMoves(moves);
        }
    }, [movesList, mode, fenState, selectedPiece, lastMove]);

    //-----------------------------------------------------------------------------
    useEffect(() => {
        if (mode === 'ai') {
            fetchStockfishData(fen, 15).then(setData);
        }
    }, [mode, fen]);


    useEffect(() => {
        if (mode === 'ai') {
            const str = data?.bestmove ? JSON.stringify(data.bestmove, null, 2) : "";
            const bestmove = str ? str.split(" ")[1] : "No best move available";
            // console.log(bestmove);
            const fromSquare = bestmove.split('')[0] + bestmove.split('')[1];
            const toSquare = bestmove.split('')[2] + bestmove.split('')[3];
            setTimeout(() => {
                // console.log(fromSquare, toSquare);
                if (document.getElementById(fromSquare)?.hasChildNodes()) {
                    if (document.getElementById(fromSquare)?.children[0].getAttribute('src')?.includes('https://www.chess.com/chess-themes/pieces/neo/150/b')) {
                        document.getElementById(fromSquare)?.click();
                        setTimeout(() => {
                            document.getElementById(toSquare)?.click();
                            setIsWhite(true);
                        }, 500);
                        document.body.style.pointerEvents = 'none';
                        document.body.style.pointerEvents = 'auto';
                    }
                }
            }, 0);
        }
    }, [data, mode]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const hasCheckMovesInUrl = urlParams.has('check_moves');

        if (checkMoves !== undefined && checkMoves === 0 && hasCheckMovesInUrl && mode === 'challenge' && !isInCheck) {
            setShowMovesDiv(true);
        }
    }, [checkMoves]);

    //-----------------------------------------------------------------------------

    // Determine role and player status
    let isHost = false, isGuest = false, role: 'host' | 'guest' | 'spectator' = 'spectator';

    if (mode === 'online' && (!user || !gameData)) {
        return <div>Caricamento partita...</div>;
    } else if (mode === 'online') {
        isHost = user.id === gameData.host_id;
        isGuest = user.id === gameData.guest_id;
        role = isHost ? 'host' : isGuest ? 'guest' : 'spectator';
    }

    let promoted = '';

    function getLastMove(firstPosition: string, lastPosition: string) {
        setLastMove(`${firstPosition}${lastPosition}`);
    }

    function createFEN(): string {

        let fen = '';

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (document.getElementById(`${letters[j]}${numbers[i]}`)?.hasChildNodes()) {
                    if (empty > 0) {
                        fen += empty;
                        empty = 0;
                    }
                    fen += switchLetter(document.getElementById(`${letters[j]}${numbers[i]}`)?.children[0]?.getAttribute('src')?.substring(50, 52));
                } else {
                    empty += 1;
                }
            }
            if (empty > 0) {
                fen += empty;
                empty = 0;
            }
            fen += '/';
        }

        fen = fen.substring(0, fen.length - 1); fen += ' ';

        if (!isWhite) {
            fen += 'w ';
        } else {
            fen += 'b ';
        }

        fen += 'KQkq ';

        if (enPassant !== '') {
            fen += `${enPassant} `;
        } else {
            fen += '- ';
        }

        fen += '0 1';

        return fen;
    }

    function switchLetter(letterColor: string | undefined) {
        switch (letterColor) {
            case 'wp':
                return 'P';
            case 'bp':
                return 'p';
            case 'wn':
                return 'N';
            case 'bn':
                return 'n';
            case 'wb':
                return 'B';
            case 'bb':
                return 'b';
            case 'wr':
                return 'R';
            case 'br':
                return 'r';
            case 'wq':
                return 'Q';
            case 'bq':
                return 'q';
            case 'wk':
                return 'K';
            case 'bk':
                return 'k';
            default:
                return '';
        }
    }

    function disableOtherMoves(possibleMoves: NodeListOf<HTMLDivElement>) {

        const possibleMovesIDs = [...possibleMoves].map((move) => move.id);

        //console.log(possibleMovesIDs);

        squares.forEach((square) => {
            if (!possibleMovesIDs.includes(square.props.id)) {
                const div = document.getElementById(square.props.id) as HTMLElement;

                if (!div?.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'w' : 'b'}`) ||
                    document.getElementById(square.props.id)?.classList.contains('bg-red-400/75') ||
                    document.getElementById(square.props.id)?.classList.contains('bg-blue-400/75')) {
                    document.getElementById(square.props.id)?.classList.contains('bg-purple-400/75');
                    if (div) {
                        div.style.pointerEvents = 'none';
                    }
                }
            }
        });
    }

    async function checkPromotion() {
        for (let i = 0; i < 8; i++) {
            if (isWhite) {
                if (document.getElementById(`${letters[i]}8`)?.children[0]?.getAttribute('src')?.includes('wp')) {
                    const result = await new Promise<string>((resolve) => {
                        setShowPromotionDiv(true);
                        setPromotionResolved(() => resolve);
                    });
                    promoted = result
                    document.getElementById(`${letters[i]}8`)?.children[0]?.setAttribute('src', `https://www.chess.com/chess-themes/pieces/neo/150/w${promoted}.png`);
                }
            } else {
                if (document.getElementById(`${letters[i]}1`)?.children[0]?.getAttribute('src')?.includes('bp')) {
                    const result = await new Promise<string>((resolve) => {
                        setShowPromotionDiv(true);
                        setPromotionResolved(() => resolve);
                    });
                    promoted = result
                    document.getElementById(`${letters[i]}1`)?.children[0]?.setAttribute('src', `https://www.chess.com/chess-themes/pieces/neo/150/b${promoted}.png`);
                }
            }
        }
    }

    function enableOtherMoves() {
        squares.forEach((square) => {
            const div = document.getElementById(square.props.id) as HTMLElement;
            if (div) {
                div.style.pointerEvents = 'auto';
            }
        });
    }

    function isKingInCheckDuringCastling(isWhite: boolean, kingPath: string[]): boolean {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const _ of kingPath) {
            if (getCheck(isWhite)) {
                return true;
            }
        }
        return false;
    }

    function performCastling(isWhite: boolean, castling: boolean, square: string) {
        const kingPosition = isWhite ? 'e1' : 'e8';
        const rookPosition = square;
        const kingTarget = square[0] === 'a' ? 'c' + square[1] : 'g' + square[1];
        const rookTarget = square[0] === 'a' ? 'd' + square[1] : 'f' + square[1];
        const kingPath = isWhite
            ? (square[0] === 'a' ? ['e1', 'd1', 'c1'] : ['e1', 'f1', 'g1'])
            : (square[0] === 'a' ? ['e8', 'd8', 'c8'] : ['e8', 'f8', 'g8']);

        if (castling && !isKingInCheckDuringCastling(isWhite, kingPath)) {
            movePiece(kingPosition, kingTarget);
            movePiece(rookPosition, rookTarget);
        }
    }

    //---------------------------------------------------------------------

    async function handleSquareClick(square: string) {

        console.log({
            game_id: gameId,
            from_sq: selectedPiece,
            to_sq: square,
            moved_by: user?.id,
            created_at: new Date().toISOString(),
        });


        if (mode === 'online') {

            if (!gameId || !square || !user?.id) {
                alert("Dati mancanti per la mossa!");
                return;
            }

            if (role === 'spectator') return;

            const isMyTurn = (isWhite && role === "host") || (!isWhite && role === "guest");
            if (mode === 'online' && !isMyTurn) return;

            // 2) Se non ho ancora selezionato un pezzo, seleziono solo se è mio
            if (selectedPiece === null) {
                // prendo l'img dentro la casella
                const imgSrc = document.getElementById(square)
                    ?.children[0]
                    ?.getAttribute('src') || '';
                const isMyPiece = isWhite
                    ? imgSrc.includes('/neo/150/w')
                    : imgSrc.includes('/neo/150/b');
                if (isMyPiece) {
                    setSelectedPiece(square);
                    const possible = showPiece(square, isWhite, lastMove);
                    disableOtherMoves(possible);
                }
                return;
            }

            if (!selectedPiece) {
                setSelectedPiece(square);
                return;
            }

            //Dopo aver mosso
            await supabase.from('game_moves').insert([{
                game_id: gameId,
                from_sq: selectedPiece!,
                to_sq: square,
                moved_by: user?.id,
                created_at: new Date().toISOString(),
            }]);

            setIsWhite(prev => !prev)
            setSelectedPiece(null); // Deseleziona il pezzo attivo
            movePiece(selectedPiece, square)
            return;
        }

        if (mode === 'ai' && isWhite || true) {
            // console.log(document.getElementById(square)?.classList.contains('bg-purple-400/75'));
            // console.log(getWhiteCastling(), getBlackCastling());

            if (document.getElementById(square)?.classList.contains('bg-purple-400/75')) {
                if (isWhite) {
                    if (getWhiteCastling()) {
                        performCastling(true, getWhiteCastling(), square);
                        setWhiteCastling(false);
                    }
                } else {
                    if (getBlackCastling()) {
                        performCastling(false, getBlackCastling(), square);
                        setBlackCastling(false);
                    }
                }
            }

            if (selectedPiece !== null) {

                if (!document.getElementById(square)?.hasChildNodes() ||
                    !document.getElementById(square)?.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'w' : 'b'}`)) {
                    getLastMove(selectedPiece, square);
                    movePiece(selectedPiece, square);
                    //console.log(`Moved piece from ${selectedPiece} to ${square}`);
                    setSelectedPiece(null); // Deseleziona il pezzo attivo
                    squares.forEach((square) => {
                        const div = document.getElementById(square.props.id) as HTMLElement;
                        if (div) {
                            if (div.classList.contains('bg-blue-400/75')) {
                                // calcola la casella del pedone catturato
                                const file = square.props.id[0];                // es. 'e'
                                const rank = square.props.id[1];               // es. '5'
                                const capturedRank = isWhite            // se è bianco, il pedone avversario era un passo più sotto
                                    ? String(Number(rank) + 1)
                                    : String(Number(rank) - 1);

                                // aggiorna lo stato della scacchiera
                                setBoard(prevBoard => {
                                    const newBoard = prevBoard.map(row => [...row]);
                                    const rowIdx = 8 - Number(capturedRank);
                                    const colIdx = file.charCodeAt(0) - 97;
                                    newBoard[rowIdx][colIdx] = "";
                                    return newBoard;
                                });
                            }
                        }
                    });
                    checkPromotion();
                    enableOtherMoves();
                    fen = createFEN();
                    actualMove = selectedPiece + square;
                    const moveData = {
                        game_id: gameId,
                        from: selectedPiece,
                        to: square,
                        fen: createFEN(),
                        user_id: user?.id,
                        created_at: new Date().toISOString(),
                    };
                    await supabase.from('game_moves').insert([moveData]);
                    setIsWhite(!isWhite);
                    if (window.innerWidth < 768 && mode === 'multiplayer') {
                        setShouldRotate(prev => !prev);
                    } else {
                        setShouldRotate(false);
                    }
                    console.log("Turno del: " + ((!isWhite) ? "bianco" : "nero"));
                    if ((checkMoves ?? -1) > 0) {
                        setCheckMoves((prev) => Math.max((prev ?? 0) - 1, 0)); // Decrementa ma si ferma a zero
                    }
                    // Check if the opponent is in check after the move
                    const opponentInCheck = getCheck(!isWhite);
                    setIsInCheck(opponentInCheck);

                    if (opponentInCheck) {
                        let legalMoves = 0;
                        squares.forEach((square) => {
                            const div = document.getElementById(square.props.id) as HTMLElement;
                            if (div) {
                                if (div.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${!isWhite ? 'w' : 'b'}`)) {
                                    const movesForPiece = Array.from(showPiece(square.props.id, !isWhite, lastMove));
                                    legalMoves += movesForPiece.length;
                                }
                            }
                        })
                        if (legalMoves === 0) {
                            setShowCheckMateDiv(true);
                            if (mode === 'challenge') {
                                try {
                                    let challengeIdToSet = challenges[0]?.id;
                                    // Cerca l'id della challenge corrispondente al fen_challenge
                                    if (fen_challenge && Array.isArray(challenges)) {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const foundChallenge = challenges.find((ch: any) => ch.fen === fen_challenge);
                                        if (foundChallenge) {
                                            challengeIdToSet = foundChallenge.id;
                                        }
                                    }
                                    if (user?.id !== undefined && challengeIdToSet !== undefined) {
                                        const formData = {
                                            userID: user.id,
                                            challengeID: challengeIdToSet,
                                        };
                                        await setChallengeComplete(formData);
                                    } else {
                                        console.warn('userID or challengeID is undefined');
                                    }
                                } catch (error) {
                                    console.log(error);
                                }
                            }
                        }
                    }
                } else if (document.getElementById(square)?.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'w' : 'b'}`)) {
                    setSelectedPiece(null);
                }
            } else {
                // Altrimenti, seleziona il pezzo
                enableOtherMoves();
                console.log("Turno del: " + ((isWhite) ? "bianco" : "nero"));

                // Check if current player is in check
                const currentPlayerInCheck = getCheck(isWhite);
                setIsInCheck(currentPlayerInCheck);

                if (document.getElementById(square)?.hasChildNodes() && document.getElementById(square)?.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'w' : 'b'}`)) {
                    setSelectedPiece(square);
                }
                const subChoosedMoves = showPiece(square, isWhite, lastMove);
                subMoves = subChoosedMoves;
                // console.log(lastMove);
                // console.log(subChoosedMoves);
                disableOtherMoves(subChoosedMoves);
                //console.log(`No piece selected`);
                squares.forEach((square) => {
                    const div = document.getElementById(square.props.id) as HTMLElement;
                    if (div.classList.contains('bg-blue-400/75')) {
                        enPassant = square.props.id;
                    }
                })
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function applyMovesToBoard(initialFEN: string, moves: any[]): string[][] {
        const board = parseFEN(initialFEN);
        moves.forEach(move => {
            // Applica la mossa: move.from_sq -> move.to_sq
            // Trova le coordinate da from_sq e to_sq (es: "e2" -> [6,4])
            const from = move.from_sq;
            const to = move.to_sq;
            const fromRow = 8 - parseInt(from[1]);
            const fromCol = from.charCodeAt(0) - 97;
            const toRow = 8 - parseInt(to[1]);
            const toCol = to.charCodeAt(0) - 97;
            board[toRow][toCol] = board[fromRow][fromCol];
            board[fromRow][fromCol] = "";
        });
        return board;
    }

    function createBoard() {

        squares.length = 0; // Reset squares array

        const rowIndexes = role === 'guest' ? [...Array(8).keys()].reverse() : [...Array(8).keys()];
        const colIndexes = role === 'guest' ? [...Array(8).keys()].reverse() : [...Array(8).keys()];

        for (const i of rowIndexes) {
            for (const j of colIndexes) {
                const squareId = `${letters[j]}${numbers[i]}`;
                squares.push(
                    <div
                        key={squareId}
                        id={squareId}
                        className={`relative aspect-square w-full flex items-center justify-center transition-effect --grid-area: ${letters[j]}${numbers[i]} ${shouldRotate ? 'rotate-180' : ''}`}
                        onClick={() => {
                            handleSquareClick(squareId);
                        }}
                    >
                        {board[i][j] && <Piece type={board[i][j]} id={`${letters[j]}${numbers[i]}`} />}
                    </div>
                );
            }
        }
        return squares;
    }

    createBoard();
    if (done === false) {
        squaress.push(...squares);
        done = true;
    }

    const handlePromotionComplete = (piece: string) => {
        if (promotionResolved) {
            promotionResolved(piece);
            setPromotionResolved(null);
            setShowPromotionDiv(false);
        }
    };

    const handleCheckMateComplete = () => {
        setShowCheckMateDiv(false);
    };

    const handleMovesComplete = () => {
        setShowMovesDiv(false);
    };

    const handleTimerComplete = () => {
        setTimerDiv(false);
    };

    return (
        <>
            <Sidebar />

            <div className="flex min-h-screen p-4 md:p-8 lg:p-12">
                {/* Sezione giocatori a sinistra */}
                {mode === "online" && (
                    <div className="flex flex-col justify-center gap-8 md:-mr-44 -min-w-[300px] md:min-w-[100px]">

                        {/* Nero */}
                        <div className="flex flex-col items-center">
                            <img
                                src={guestUser?.avatar || "/default-avatar.png"}
                                alt="Nero"
                                className={`w-14 h-14 rounded-full border-4 ${!isWhite ? 'border-yellow-400' : 'border-gray-300'}`}
                            />
                            <span className="mt-1 font-semibold text-gray-700">Nero</span>
                            <span className="text-xs text-white">{guestUser?.username || guestUser?.email || gameData.guest_id}</span>
                        </div>

                        <span className="text-3xl font-bold text-white text-center">vs</span>

                        {/* Bianco */}
                        <div className="flex flex-col items-center">
                            <img
                                src={hostUser?.avatar || "/default-avatar.png"}
                                alt="Bianco"
                                className={`w-14 h-14 rounded-full border-4 ${isWhite ? 'border-yellow-400' : 'border-gray-300'}`}
                            />
                            <span className="mt-1 font-semibold text-gray-700">Bianco</span>
                            <span className="text-xs text-white">{hostUser?.username || hostUser?.email || gameData.host_id}</span>
                        </div>
                    </div>
                )}

                {/* Sezione principale con scacchiera */}
                <div className="flex-1 flex flex-col items-center justify-center relative">

                    {/* {gameId && (
                        <div className="text-center mb-4 text-sm text-gray-600 select-all">
                            <span className="font-semibold">ID Partita:</span> {gameId}
                        </div>
                    )} */}

                    {showPromotionDiv && (
                        <PromotionModal onPromotionComplete={handlePromotionComplete} />
                    )}
                    {showCheckMateDiv && (
                        <CheckMateModal onCheckMateComplete={handleCheckMateComplete} isWhite={isWhite} isChallenge={mode === 'challenge'} />
                    )}
                    {showTimerDiv && (check_moves ?? 0) <= 0 && (
                        <TimerModal onTimerComplete={handleTimerComplete} isWhite={isWhite} />
                    )}
                    {showMovesDiv && (
                        <MovesModal onMovesComplete={handleMovesComplete} />
                    )}
                    {(check_moves ?? 0) <= 0 && <ChessTimer isWhite={isWhite} initialTime={time} role={role} />}
                    
                    <div className="flex flex-col items-center w-full max-w-[95vh] lg:max-w-[85vh] xl:max-w-[86vh] mx-auto md:items-start gap-4">
                        {/* Scacchiera */}
                        <div
                            className={`relative w-full aspect-square border-8 md:border-12 lg:border-16 shadow-xl border-solid ${darkMode ? 'border-slate-800' : 'border-orange-900'} bg-white bg-cover bg-no-repeat rounded-lg z-0`}
                            style={{
                                backgroundImage: `url(${darkMode ? '/ChessBoardDark.jpg' : '/ChessBoardLight.jpg'})`,
                                // backgroundBlendMode: 'multiply'
                            }}
                        >
                            <svg viewBox="0 0 100 100" className="coordinates">
                                <text x="0.75" y="3.5" fontSize="2.8" style={{ fill: `${darkMode ? '#1c2f2f' : '#739552'}` }}>8</text>
                                <text x="0.75" y="15.75" fontSize="2.8" style={{ fill: '#EBECD0' }}>7</text>
                                <text x="0.75" y="28.25" fontSize="2.8" style={{ fill: `${darkMode ? '#1c2f2f' : '#739552'}` }}>6</text>
                                <text x="0.75" y="40.75" fontSize="2.8" style={{ fill: '#EBECD0' }}>5</text>
                                <text x="0.75" y="53.25" fontSize="2.8" style={{ fill: `${darkMode ? '#1c2f2f' : '#739552'}` }}>4</text>
                                <text x="0.75" y="65.75" fontSize="2.8" style={{ fill: '#EBECD0' }}>3</text>
                                <text x="0.75" y="78.25" fontSize="2.8" style={{ fill: `${darkMode ? '#1c2f2f' : '#739552'}` }}>2</text>
                                <text x="0.75" y="90.75" fontSize="2.8" style={{ fill: '#EBECD0' }}>1</text>
                                <text x="10" y="99" fontSize="2.8" style={{ fill: '#EBECD0' }}>a</text>
                                <text x="22.5" y="99" fontSize="2.8" style={{ fill: `${darkMode ? '#1c2f2f' : '#739552'}` }}>b</text>
                                <text x="35" y="99" fontSize="2.8" style={{ fill: '#EBECD0' }}>c</text>
                                <text x="47.5" y="99" fontSize="2.8" style={{ fill: `${darkMode ? '#1c2f2f' : '#739552'}` }}>d</text>
                                <text x="60" y="99" fontSize="2.8" style={{ fill: '#EBECD0' }}>e</text>
                                <text x="72.5" y="99" fontSize="2.8" style={{ fill: `${darkMode ? '#1c2f2f' : '#739552'}` }}>f</text>
                                <text x="85" y="99" fontSize="2.8" style={{ fill: '#EBECD0' }}>g</text>
                                <text x="97.5" y="99" fontSize="2.8" style={{ fill: `${darkMode ? '#1c2f2f' : '#739552'}` }}>h</text>
                            </svg>
                            <div className="absolute inset-0 grid-chess grid-cols-8 grid-rows-8 bg-cover bg-center z-20">
                                {squares}
                            </div>
                        </div>
                    </div>
                    {(check_moves ?? 0) > 0 && (
                            <div
                                className="w-full md:w-auto mt-4 md:mt-0 flex justify-center order-last md:order-none translate-y-28 translate-x-10 md:-translate-y-72 md:translate-x-[100]"
                            >
                                <ChessMoves check_moves={checkMoves ?? 0} />
                            </div>
                        )}
                </div>
            </div>
        </>
    );
}