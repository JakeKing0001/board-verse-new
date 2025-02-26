"use client";

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

const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
const numbers = [8, 7, 6, 5, 4, 3, 2, 1];
const squaress: JSX.Element[] = [];
let fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; let empty = 0; let enPassant = '';
let actualMove: string;
let done = false;
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

    return board;
}

export default function ChessBoard({ mode, time }: { mode: string, time: number }) {

    const wsRef = React.useRef<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket("wss://board-verse.onrender.com");
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("✅ Connesso al server!");
            ws.send("Ciao, sono un client!");
        };

        ws.onmessage = (event) => {
            console.log("📩 Messaggio dal server:", event.data);
        };

        ws.onclose = () => {
            console.log("❌ Disconnesso dal server");
        };

        ws.onerror = (event) => {
            console.error("⚠️ Errore WebSocket Client:", event);
        };

    }, []);

    // Funzione per inviare una mossa
    const sendMove = (move: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(move);
        }
    };

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

    const initialFEN = fen;
    const [board] = useState<string[][]>(parseFEN(initialFEN));
    const [isWhite, setIsWhite] = useState(initialFEN.split(" ")[1] === "w");
    const [showPromotionDiv, setShowPromotionDiv] = useState(false);
    const [promotionResolved, setPromotionResolved] = useState<((value: string) => void) | null>(null);
    const [data, setData] = useState<StockfishData | null>(null);
    const [showCheckMateDiv, setShowCheckMateDiv] = useState(false);
    const [showTimerDiv, setTimerDiv] = useState(false);

    const { isGameOver } = usePieceContext();

    let promoted = '';

    useEffect(() => {
        if (isGameOver !== '') {
            setTimerDiv(true);
        }
    }, [isGameOver]);

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


    const [selectedPiece, setSelectedPiece] = useState<string | null>(null); // Stato del pezzo attivo

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

    //-----------------------------------------------------------

    useEffect(() => {
        if (mode === 'ai') {
            fetchStockfishData(fen, 15).then(setData);
        }
    }, [mode]);


    useEffect(() => {
        if (mode === 'ai') {
            const str = data?.bestmove ? JSON.stringify(data.bestmove, null, 2) : "";
            const bestmove = str ? str.split(" ")[1] : "No best move available";
            console.log(bestmove);
            const fromSquare = bestmove.split('')[0] + bestmove.split('')[1];
            const toSquare = bestmove.split('')[2] + bestmove.split('')[3];
            setTimeout(() => {
                console.log(fromSquare, toSquare);
                if (document.getElementById(fromSquare)?.hasChildNodes()) {
                    if (document.getElementById(fromSquare)?.children[0].getAttribute('src')?.includes('https://www.chess.com/chess-themes/pieces/neo/150/b')) {
                        movePiece(fromSquare, toSquare);
                        setIsWhite(true);
                    }
                }
            }, 1000);
        }
    });
    //---------------------------------------------------------------------

    function handleSquareClick(square: string) {

        console.log(document.getElementById(square)?.classList.contains('bg-purple-400/75'));
        console.log(getWhiteCastling(), getBlackCastling());

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
                            const coordinates = square.props.id.split('');
                            enPassant = square.props.id;
                            const letter = coordinates[0];
                            const number = coordinates[1];
                            document.getElementById(letter + ((parseInt(number) + (isWhite ? -1 : 1)) + ''))?.children[0]?.remove();
                        }
                    }
                });
                checkPromotion();
                enableOtherMoves();
                fen = createFEN();
                actualMove = selectedPiece + square;
                console.log(actualMove);
                console.log(fen);
                setIsWhite(!isWhite);
                console.log("Turno del: " + ((!isWhite) ? "bianco" : "nero"));
                if (getCheck(!isWhite)) {
                    squares.forEach((square) => {
                        const div = document.getElementById(square.props.id) as HTMLElement;
                        if (div) {
                            if (div.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${!isWhite ? 'w' : 'b'}`)) {
                                moves = Array.from(showPiece(square.props.id, !isWhite, lastMove));
                                const subMovesArray = Array.from(subMoves);

                                subMovesArray.forEach((subMove) => {
                                    moves.forEach((move, index) => {
                                        if (move.id === subMove.id) {
                                            moves.splice(index, 1);
                                        }
                                    });
                                });
                            }
                        }
                    })
                    if (moves.length === 0) {
                        setShowCheckMateDiv(true);
                    }
                }
            } else if (document.getElementById(square)?.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'w' : 'b'}`)) {
                setSelectedPiece(null);
            }
        } else {
            // Altrimenti, seleziona il pezzo
            enableOtherMoves();
            console.log("Turno del: " + ((isWhite) ? "bianco" : "nero"));
            getCheck(isWhite);
            if (document.getElementById(square)?.hasChildNodes() && document.getElementById(square)?.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'w' : 'b'}`)) {
                setSelectedPiece(square);
            }
            const subChoosedMoves = showPiece(square, isWhite, lastMove);
            subMoves = subChoosedMoves;
            // console.log(lastMove);
            console.log(subChoosedMoves);
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


    function createBoard() {
        for (let i: number = 0; i < 8; i++) {
            for (let j: number = 0; j < 8; j++) {
                squares.push(
                    <div
                        key={`${letters[j]}${numbers[i]}`}
                        id={`${letters[j]}${numbers[i]}`}
                        className={`relative aspect-square w-full flex items-center justify-center transition-effect --grid-area: ${letters[j]}${numbers[i]}`}
                        onClick={() => {
                            handleSquareClick(`${letters[j]}${numbers[i]}`);
                        }}
                    >
                        {board[i][j] && <Piece type={board[i][j]} />}
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

    const handleTimerComplete = () => {
        setTimerDiv(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 md:p-8 lg:p-12 relative">
            {showPromotionDiv && (
                <PromotionModal onPromotionComplete={handlePromotionComplete} />
            )}
            {showCheckMateDiv && (
                <CheckMateModal onCheckMateComplete={handleCheckMateComplete} />
            )}
            {showTimerDiv && (
                <TimerModal onTimerComplete={handleTimerComplete} isWhite={isWhite} />
            )}
            <button onClick={() => sendMove("a2a4")}>Invia mossa: a2a4</button>
            <ChessTimer isWhite={isWhite} initialTime={time} />
            <div className="w-full max-w-[95vh] lg:max-w-[85vh] xl:max-w-[86vh] mx-auto -mt-14">
                {/* Scacchiera */}
                <div
                    className="relative w-full aspect-square border-8 md:border-12 lg:border-16 shadow-xl border-solid border-orange-900 bg-white bg-cover bg-no-repeat rounded-lg z-0"
                    style={{
                        backgroundImage: `url('https://assets-themes.chess.com/image/9rdwe/200.png')`,
                        backgroundBlendMode: 'multiply'
                    }}
                >
                    <svg viewBox="0 0 100 100" className="coordinates">
                        <text x="0.75" y="3.5" fontSize="2.8" style={{ fill: '#739552' }}>8</text><text x="0.75" y="15.75" fontSize="2.8" style={{ fill: '#EBECD0' }}>7</text><text x="0.75" y="28.25" fontSize="2.8" style={{ fill: '#739552' }}>6</text><text x="0.75" y="40.75" fontSize="2.8" style={{ fill: '#EBECD0' }}>5</text><text x="0.75" y="53.25" fontSize="2.8" style={{ fill: '#739552' }}>4</text><text x="0.75" y="65.75" fontSize="2.8" style={{ fill: '#EBECD0' }}>3</text><text x="0.75" y="78.25" fontSize="2.8" style={{ fill: '#739552' }}>2</text><text x="0.75" y="90.75" fontSize="2.8" style={{ fill: '#EBECD0' }}>1</text><text x="10" y="99" fontSize="2.8" style={{ fill: '#EBECD0' }}>a</text><text x="22.5" y="99" fontSize="2.8" style={{ fill: '#739552' }}>b</text><text x="35" y="99" fontSize="2.8" style={{ fill: '#EBECD0' }}>c</text><text x="47.5" y="99" fontSize="2.8" style={{ fill: '#739552' }}>d</text><text x="60" y="99" fontSize="2.8" style={{ fill: '#EBECD0' }}>e</text><text x="72.5" y="99" fontSize="2.8" style={{ fill: '#739552' }}>f</text><text x="85" y="99" fontSize="2.8" style={{ fill: '#EBECD0' }}>g</text><text x="97.5" y="99" fontSize="2.8" style={{ fill: '#739552' }}>h</text>
                    </svg>
                    <div className="absolute inset-0 grid-chess grid-cols-8 grid-rows-8 bg-cover bg-center z-20">
                        {squares}
                    </div>
                </div>
            </div>
        </div>
    );
}