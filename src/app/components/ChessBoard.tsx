import React, { useState, useEffect, JSX } from 'react';
import Piece from './Piece';
import {
    clearMoveHighlights,
    showPiece,
    getEnpassant,
    setWhiteCastling,
    setBlackCastling,
} from '../pieceLogic';
import { usePieceContext } from './PieceContext';
import PromotionModal from './PromotionModal';
import CheckMateModal from './CheckMateModal';
import { getCheck, getCheckmate, getDraw, getStalemate, getThreefoldRepetition, getInsufficientMaterial } from '../checkMateLogic';
import { fetchStockfishData } from '../stockFishUtils';
import ChessTimer from './ChessTimer';
import TimerModal from './TimerModal';
import Sidebar from './SideBar';
import ChessMoves from './ChessMoves';
import MovesModal from './MovesModal';
import { setChallengeComplete } from '../../../services/challengeComplete';
import { supabase } from '../../../lib/supabase';
import { debugLog } from '../../../lib/debug';
import { useSearchParams } from 'next/navigation';
import { Chess, type Square } from 'chess.js';
import toast from 'react-hot-toast';
import { submitGameMove } from '../../../services/games';
import type { GameSummary } from '../../types/domain';
import {
    parseFenBoard,
    replayStoredMoves,
    STANDARD_START_FEN,
} from '../../lib/chessState';
import {
    applyUciMove,
    normalizeStockfishDifficulty,
    stockfishDepthForDifficulty,
    STOCKFISH_LEVELS,
} from '../../lib/stockfish';

// Sopprimi silenziosamente i NotFoundError generati da React quando prova a rimuovere un nodo già rimosso
const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
const numbers = [8, 7, 6, 5, 4, 3, 2, 1];

export function getLetters() {
    return letters;
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
interface StoredGameMove {
    id?: number;
    from_sq: string;
    to_sq: string;
    moved_by?: number;
    promotion?: string | null;
    ply?: number;
}

export default function ChessBoard({ mode, time, fen_challenge, check_moves, gameData }: { mode: string, time: number, fen_challenge?: string, check_moves?: number, gameData?: GameSummary }) {

    const [isInCheck, setIsInCheck] = useState(false);
    const [movesList, setMovesList] = useState<StoredGameMove[]>([]);
    const [lastMove, setLastMove] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId') || '';
    const stockfishDifficulty = normalizeStockfishDifficulty(searchParams.get('difficulty'));
    const stockfishDepth = stockfishDepthForDifficulty(stockfishDifficulty);
    const stockfishLevel = STOCKFISH_LEVELS[stockfishDifficulty - 1];
    const { isGameOver, selectedPiece, setSelectedPiece, user, allUsers, challenges, setChallenges, darkMode, t } = usePieceContext();

    const hostUser = allUsers.find((u) => u.id === gameData?.host_id);
    const guestUser = allUsers.find((u) => u.id === gameData?.guest_id);

    useEffect(() => {
        if (mode === 'online' && gameId) {
            debugLog('🚀 Inizializzo realtime per gameId:', gameId);
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
                        debugLog('⏱️ real-time payload:', payload.new);
                        const gm = payload.new as StoredGameMove;

                        setLastMove(gm.from_sq + gm.to_sq);
                        setMovesList(prev => {
                            if (gm.id && prev.some((move) => move.id === gm.id)) {
                                return prev;
                            }
                            const updated = [...prev, gm].sort(
                                (left, right) => (left.ply ?? 0) - (right.ply ?? 0),
                            );
                            return updated;
                        });
                    }
                )
                .subscribe()

            // Carica le mosse esistenti all'avvio
            supabase
                .from('game_moves')
                .select('*')
                .eq('game_id', gameId)
                .order('ply', { ascending: true })
                .then(({ data }) => setMovesList((data as StoredGameMove[]) || []));

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [mode, gameId]);

    const squares: JSX.Element[] = [];

    const isEnPassant = true;

    useEffect(() => {
        getEnpassant(isEnPassant);
    }, [isEnPassant]);

    const initialFEN = (fen_challenge && mode === 'challenge')
        ? fen_challenge
        : STANDARD_START_FEN;
    const [fenState, setFenState] = useState(initialFEN);
    const [board, setBoard] = useState<string[][]>(parseFenBoard(initialFEN));
    const [isWhite, setIsWhite] = useState(initialFEN.split(" ")[1] === "w");
    const [showPromotionDiv, setShowPromotionDiv] = useState(false);
    const [promotionResolved, setPromotionResolved] = useState<((value: string) => void) | null>(null);
    const [isDrawState, setIsDrawState] = useState(false);
    const [showCheckMateDiv, setShowCheckMateDiv] = useState(false);
    const [showTimerDiv, setTimerDiv] = useState(false);
    const [showMovesDiv, setShowMovesDiv] = useState(false);
    const [checkMoves, setCheckMoves] = useState<number>(check_moves ?? 0);

    const [cpuMoves, setCpuMoves] = useState<string[]>([]);
    const [cpuIndex, setCpuIndex] = useState(0);
    const [cpuMoveInProgress, setCpuMoveInProgress] = useState(false);
    const [stockfishSource, setStockfishSource] = useState<'stockfish' | 'local-fallback' | null>(null);

    const [shouldRotate, setShouldRotate] = useState(false);

    const fenParts = initialFEN.split(" ");
    const castlingField = fenParts[2] || '-';
    const [whiteKingSide, setWhiteKingSide] = useState(castlingField.includes('K'));
    const [whiteQueenSide, setWhiteQueenSide] = useState(castlingField.includes('Q'));
    const [blackKingSide, setBlackKingSide] = useState(castlingField.includes('k'));
    const [blackQueenSide, setBlackQueenSide] = useState(castlingField.includes('q'));

    useEffect(() => {
        if (mode !== 'challenge' || challenges.length > 0) return;

        let active = true;
        import('../../../services/challenge')
            .then(({ getChallenge }) => getChallenge())
            .then((catalog) => {
                if (active) setChallenges(catalog);
            })
            .catch((error) => console.error('Impossibile caricare le challenge:', error));

        return () => {
            active = false;
        };
    }, [challenges.length, mode, setChallenges]);
    useEffect(() => {
        setWhiteCastling(whiteKingSide || whiteQueenSide);
    }, [whiteKingSide, whiteQueenSide]);

    useEffect(() => {
        setBlackCastling(blackKingSide || blackQueenSide);
    }, [blackKingSide, blackQueenSide]);

    // Load CPU moves for the current challenge
    interface Challenge { id: number; fen: string; cpu_moves?: string[] | string | null; number_moves?: number; }
    useEffect(() => {
        if (mode === 'challenge' && fen_challenge) {
            const challenge = challenges.find((ch: Challenge) => ch.fen === fen_challenge);
           if (challenge) {
                const { cpu_moves } = challenge;
                let moves: string[] = [];
                if (Array.isArray(cpu_moves)) {
                    moves = cpu_moves;
                } else if (typeof cpu_moves === 'string') {
                    try {
                        const parsed = JSON.parse(cpu_moves);
                        if (Array.isArray(parsed)) {
                            moves = parsed.map((m) => String(m));
                        }
                    } catch (e) {
                        console.error('Failed to parse cpu moves', e);
                    }
                }
                setCpuMoves(moves);
            }
        }
    }, [mode, fen_challenge, challenges]);

    useEffect(() => {
        setFenState(initialFEN);
        setBoard(parseFenBoard(initialFEN));
        setIsWhite(initialFEN.split(" ")[1] === "w");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, fen_challenge]);

    useEffect(() => {
        if (isGameOver !== '') {
            setTimerDiv(true);
        }
    }, [isGameOver]);

    useEffect(() => {
        if (!selectedPiece) clearMoveHighlights();
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

        // Pulisci soltanto lo stato interattivo della scacchiera.
        clearMoveHighlights();

        // 2) Ricostruisci la board dal FEN in stato
        let position;
        try {
            position = replayStoredMoves(initialFEN, movesList);
        } catch (error) {
            console.error('Invalid online move history:', error);
            toast.error('La partita contiene una sequenza di mosse non valida.');
            return;
        }
        const newFen = position.fen;
        setBoard(position.board);
        setFenState(position.fen);

        // 3) Alterna subito il turno
        setIsWhite(position.turn === 'w');

        //4) check & checkmate and stalemate
        if (getCheck(newFen)) {
            if (getCheckmate(newFen)) {
                setIsDrawState(false);
                setShowCheckMateDiv(true);
            }
        } else {
            if (
                getDraw(newFen) ||
                getStalemate(newFen) ||
                getThreefoldRepetition(newFen) ||
                getInsufficientMaterial(newFen)
            ) {
                setIsDrawState(true);
                setShowCheckMateDiv(true);
            }
        }

        // 4) (Opzionale) Se vuoi mostrare mosse possibili all’inizio del turno
        //    fallo **solo** per il pezzo selezionato, non per tutti i pezzi.
    }, [movesList, mode, initialFEN]);

    // Stockfish muove soltanto quando è il turno del nero. La richiesta viene
    // annullata se la posizione cambia, evitando risposte fuori ordine.
    useEffect(() => {
        if (mode !== 'ai') return;

        const currentPosition = new Chess(fenState);
        if (currentPosition.turn() !== 'b' || currentPosition.isGameOver()) return;

        const controller = new AbortController();
        let active = true;
        setCpuMoveInProgress(true);
        setStockfishSource(null);

        const playStockfishMove = async () => {
            try {
                const analysis = await fetchStockfishData(fenState, stockfishDepth, controller.signal);
                if (!active) return;

                const engineResult = applyUciMove(fenState, analysis.move, 'b');
                const { move: appliedMove, fen: newFen } = engineResult;
                const fromSquare = appliedMove.from;
                const toSquare = appliedMove.to;
                const castlingRights = newFen.split(' ')[2] ?? '-';

                setBoard(engineResult.board);
                setFenState(newFen);
                setIsWhite(engineResult.turn === 'w');
                setWhiteKingSide(castlingRights.includes('K'));
                setWhiteQueenSide(castlingRights.includes('Q'));
                setBlackKingSide(castlingRights.includes('k'));
                setBlackQueenSide(castlingRights.includes('q'));
                setLastMove(`${fromSquare}${toSquare}`);
                setSelectedPiece(null);
                setStockfishSource(analysis.source);
                setIsInCheck(engineResult.isCheck);

                if (engineResult.isCheckmate) {
                    setIsDrawState(false);
                    setShowCheckMateDiv(true);
                } else if (engineResult.isDraw) {
                    setIsDrawState(true);
                    setShowCheckMateDiv(true);
                }
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') return;
                console.error('Analisi Stockfish non disponibile:', error);
                toast.error('Il motore non riesce ad analizzare questa posizione. Riprova.');
            } finally {
                if (active) setCpuMoveInProgress(false);
            }
        };

        void playStockfishMove();
        return () => {
            active = false;
            controller.abort();
        };
    }, [fenState, mode, setSelectedPiece, stockfishDepth]);

    useEffect(() => {

        if (cpuMoveInProgress) return;

        const urlParams = new URLSearchParams(window.location.search);
        const hasCheckMovesInUrl = urlParams.has('check_moves');

        debugLog('checkMoves:', checkMoves, 'hasCheckMovesInUrl:', hasCheckMovesInUrl, 'mode:', mode, 'isInCheck:', isInCheck);

        if (checkMoves === 0 && mode === 'challenge' && !isInCheck) {
            setShowMovesDiv(true);
        }
    }, [checkMoves, cpuMoveInProgress, mode, isInCheck]);

    //-----------------------------------------------------------------------------

    // Determine role and player status
    let isHost = false, isGuest = false, role: 'host' | 'guest' | 'spectator' = 'spectator';

    if (mode === 'online' && (!user || !gameData)) {
        return <div>Caricamento partita...</div>;
    } else if (mode === 'online') {
        isHost = user!.id === gameData!.host_id;
        isGuest = user!.id === gameData!.guest_id;
        role = isHost ? 'host' : isGuest ? 'guest' : 'spectator';
    }

    function getLastMove(firstPosition: string, lastPosition: string) {
        setLastMove(`${firstPosition}${lastPosition}`);
    }

    function disableOtherMoves(possibleMoves: NodeListOf<HTMLDivElement>) {
        const possibleMoveIds = new Set([...possibleMoves].map((move) => move.id));
        const position = new Chess(fenState);
        const currentColor = position.turn();

        document.querySelectorAll<HTMLElement>('.board-square').forEach((square) => {
            const piece = position.get(square.id as Square);
            const canSelect = possibleMoveIds.has(square.id) || piece?.color === currentColor;
            square.style.pointerEvents = canSelect ? 'auto' : 'none';
        });
    }

    function enableOtherMoves() {
        clearMoveHighlights();
    }

    async function handleLocalBoardClick(clickedSquare: string) {
        const chess = new Chess(fenState);
        const clickedPiece = chess.get(clickedSquare as Square);
        const currentColor = chess.turn();

        if (!selectedPiece) {
            if (clickedPiece?.color !== currentColor) return;
            setSelectedPiece(clickedSquare);
            const possibleMoves = showPiece(
                clickedSquare,
                currentColor === 'w',
                lastMove,
                fenState,
            );
            disableOtherMoves(possibleMoves);
            return;
        }

        const fromSquare = selectedPiece;
        const selectedPieceState = chess.get(fromSquare as Square);
        if (clickedPiece?.color === currentColor) {
            setSelectedPiece(clickedSquare);
            enableOtherMoves();
            const possibleMoves = showPiece(
                clickedSquare,
                currentColor === 'w',
                lastMove,
                fenState,
            );
            disableOtherMoves(possibleMoves);
            return;
        }

        const targetSquare = clickedSquare;

        let promotion: string | undefined;
        if (
            selectedPieceState?.type === 'p'
            && (targetSquare.endsWith('8') || targetSquare.endsWith('1'))
        ) {
            promotion = await new Promise<string>((resolve) => {
                setShowPromotionDiv(true);
                setPromotionResolved(() => resolve);
            });
        }

        let appliedMove;
        try {
            appliedMove = chess.move({
                from: fromSquare as Square,
                to: targetSquare as Square,
                promotion,
            });
        } catch {
            appliedMove = null;
        }

        if (!appliedMove) {
            toast.error('Mossa non valida.');
            setSelectedPiece(null);
            enableOtherMoves();
            return;
        }

        const newFen = chess.fen();
        const newFenParts = newFen.split(' ');
        const newCastlingRights = newFenParts[2] ?? '-';

        setBoard(parseFenBoard(newFen));
        setFenState(newFen);
        setIsWhite(chess.turn() === 'w');
        setWhiteKingSide(newCastlingRights.includes('K'));
        setWhiteQueenSide(newCastlingRights.includes('Q'));
        setBlackKingSide(newCastlingRights.includes('k'));
        setBlackQueenSide(newCastlingRights.includes('q'));
        getLastMove(fromSquare, targetSquare);
        setSelectedPiece(null);
        enableOtherMoves();

        const opponentInCheck = chess.isCheck();
        setIsInCheck(opponentInCheck);
        if (chess.isCheckmate()) {
            setIsDrawState(false);
            setShowCheckMateDiv(true);
            if (mode === 'challenge') {
                const challenge = challenges.find(
                    (candidate: Challenge) => candidate.fen === fen_challenge,
                );
                if (challenge?.id !== undefined && user?.id !== undefined) {
                    try {
                        await setChallengeComplete(challenge.id);
                    } catch (error) {
                        console.error('Unable to complete challenge:', error);
                    }
                }
            }
        } else if (chess.isDraw() || chess.isStalemate() || chess.isInsufficientMaterial()) {
            setIsDrawState(true);
            setShowCheckMateDiv(true);
        }

        if (!cpuMoveInProgress && checkMoves > 0) {
            setCheckMoves((previous) => Math.max(previous - 1, 0));
        }

        if (window.innerWidth < 768 && mode === 'multiplayer') {
            setShouldRotate((previous) => !previous);
        } else {
            setShouldRotate(false);
        }

        if (mode === 'challenge' && cpuIndex < cpuMoves.length) {
            const cpuMove = cpuMoves[cpuIndex];
            const fromSquare = cpuMove.slice(0, 2);
            const toSquare = cpuMove.slice(2, 4);
            setCpuIndex((previous) => previous + 1);
            setCpuMoveInProgress(true);
            window.setTimeout(() => {
                document.getElementById(fromSquare)?.click();
                window.setTimeout(() => {
                    document.getElementById(toSquare)?.click();
                    setCpuMoveInProgress(false);
                }, 350);
            }, 350);
        }
    }

    //---------------------------------------------------------------------

    async function handleSquareClick(square: string) {
        if (mode === 'ai') {
            const currentTurn = new Chess(fenState).turn();
            if (cpuMoveInProgress || currentTurn === 'b') return;
        }

        debugLog({
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
                const currentPosition = new Chess(fenState);
                const piece = currentPosition.get(square as Square);
                const isMyPiece = piece?.color === currentPosition.turn();
                if (isMyPiece) {
                    setSelectedPiece(square);
                    const possible = showPiece(square, isWhite, lastMove, fenState);
                    disableOtherMoves(possible);
                }
                return;
            }

            if (!selectedPiece) {
                setSelectedPiece(square);
                return;
            }

            let legalMove;
            try {
                const chess = new Chess(fenState);
                legalMove = chess.move({
                    from: selectedPiece as Square,
                    to: square as Square,
                    promotion: 'q',
                });
            } catch {
                legalMove = null;
            }
            if (!legalMove) {
                toast.error('Mossa non valida.');
                return;
            }

            try {
                await submitGameMove(gameId, {
                    from: selectedPiece,
                    to: square,
                    promotion: legalMove.promotion,
                });
                setSelectedPiece(null);
                enableOtherMoves();
            } catch (error) {
                console.error('Unable to submit online move:', error);
                toast.error('La mossa non è stata accettata. Aggiorna la partita e riprova.');
            }
            return;
        }

        await handleLocalBoardClick(square);
        return;

        /*
         * Legacy DOM-based move path retained temporarily for reference while
         * all active moves now flow through chess.js in handleLocalBoardClick.
         *
        if (mode !== 'ai' && isWhite || true) {

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
                    const fromPiece = document.getElementById(selectedPiece)?.children[0]?.getAttribute('src') || '';
                    const targetPiece = document.getElementById(square)?.children[0]?.getAttribute('src') || '';
                    const isPawn = fromPiece.includes('wp') || fromPiece.includes('bp');
                    const isCapture = !!targetPiece;

                    if (selectedPiece === 'e1') { setWhiteKingSide(false); setWhiteQueenSide(false); }
                    if (selectedPiece === 'h1') { setWhiteKingSide(false); }
                    if (selectedPiece === 'a1') { setWhiteQueenSide(false); }
                    if (selectedPiece === 'e8') { setBlackKingSide(false); setBlackQueenSide(false); }
                    if (selectedPiece === 'h8') { setBlackKingSide(false); }
                    if (selectedPiece === 'a8') { setBlackQueenSide(false); }

                    if (square === 'a1') { setWhiteQueenSide(false); }
                    if (square === 'h1') { setWhiteKingSide(false); }
                    if (square === 'a8') { setBlackQueenSide(false); }
                    if (square === 'h8') { setBlackKingSide(false); }

                    if (isPawn && Math.abs(parseInt(selectedPiece[1]) - parseInt(square[1])) === 2) {
                        const epRank = (parseInt(selectedPiece[1]) + parseInt(square[1])) / 2;
                        enPassant = selectedPiece[0] + epRank;
                    } else {
                        enPassant = '';
                    }

                    if (isPawn || isCapture) {
                        setHalfmoveClock(0);
                    } else {
                        setHalfmoveClock(h => h + 1);
                    }

                    if (!isWhite) {
                        setFullmoveNumber(f => f + 1);
                    }
                    getLastMove(selectedPiece, square);
                    movePiece(selectedPiece, square);
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
                    await checkPromotion();
                    enableOtherMoves();
                    const newFen = createFEN();
                    setFenState(newFen);
                    fen = newFen;
                    actualMove = selectedPiece + square;
                    if (mode === 'online' && gameId && user) {
                        await supabase.from('game_moves').insert([{
                            game_id: gameId,
                            from_sq: selectedPiece,
                            to_sq: square,
                            moved_by: user.id,
                            created_at: new Date().toISOString(),
                        }]);
                    }
                    setIsWhite(!isWhite);
                    if (window.innerWidth < 768 && mode === 'multiplayer') {
                        setShouldRotate(prev => !prev);
                    } else {
                        setShouldRotate(false);
                    }
                    debugLog('Turno del: ' + (!isWhite ? 'bianco' : 'nero'));
                    if (!cpuMoveInProgress && (checkMoves ?? -1) > 0) {
                        setCheckMoves((prev) => Math.max((prev ?? 0) - 1, 0)); // Decrementa ma si ferma a zero
                    }
                    // Check if the opponent is in check after the move
                    const opponentInCheck = getCheck(newFen);
                    setIsInCheck(opponentInCheck);

                    if (opponentInCheck) {
                        if (getCheckmate(newFen)) {
                            setIsDrawState(false);
                            setShowCheckMateDiv(true);
                            if (mode === 'challenge') {
                                try {
                                    let challengeIdToSet = challenges[0]?.id;
                                    // Cerca l'id della challenge corrispondente al fen_challenge
                                    if (fen_challenge && Array.isArray(challenges)) {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const foundChallenge = challenges.find((ch: Challenge) => ch.fen === fen_challenge);
                                        if (foundChallenge) {
                                            challengeIdToSet = foundChallenge.id;
                                        }
                                    }
                                    if (user?.id !== undefined && challengeIdToSet !== undefined) {
                                        await setChallengeComplete(challengeIdToSet);
                                    } else {
                                        debugWarn('userID or challengeID is undefined');
                                    }
                                } catch (error) {
                                    console.error(error);
                                }
                            }
                        } else if (
                            getDraw(newFen) ||
                            getStalemate(newFen) ||
                            getThreefoldRepetition(newFen) ||
                            getInsufficientMaterial(newFen)
                        ) {
                            setIsDrawState(true);
                            setShowCheckMateDiv(false);
                        }
                    }
                    // Execute next CPU move in challenge mode
                    if (mode === 'challenge' && cpuIndex < cpuMoves.length) {
                        const cpuMove = cpuMoves[cpuIndex];
                        const fromSquare = cpuMove.slice(0, 2);
                        const toSquare = cpuMove.slice(2, 4);
                        setCpuIndex(prev => prev + 1);
                        setCpuMoveInProgress(true);
                        setTimeout(() => {
                            document.getElementById(fromSquare)?.click();
                            setTimeout(() => {
                                document.getElementById(toSquare)?.click();
                                setCpuMoveInProgress(false);
                            }, 500);
                        }, 500);
                    }
                } else if (document.getElementById(square)?.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'w' : 'b'}`)) {
                    setSelectedPiece(null);
                }
            } else {
                // Altrimenti, seleziona il pezzo
                enableOtherMoves();
                debugLog('Turno del: ' + (isWhite ? 'bianco' : 'nero'));

                // Check if current player is in check
                const currentPlayerInCheck = getCheck(fenState);
                setIsInCheck(currentPlayerInCheck);

                if (document.getElementById(square)?.hasChildNodes() && document.getElementById(square)?.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'w' : 'b'}`)) {
                    setSelectedPiece(square);
                }
                const subChoosedMoves = showPiece(square, isWhite, lastMove, fenState);
                subMoves = subChoosedMoves;
                disableOtherMoves(subChoosedMoves);
                // keep current en passant state
            }
        }
        */
    }

    function createBoard() {

        squares.length = 0; // Reset squares array

        const rowIndexes = role === 'guest' ? [...Array(8).keys()].reverse() : [...Array(8).keys()];
        const colIndexes = role === 'guest' ? [...Array(8).keys()].reverse() : [...Array(8).keys()];

        for (const i of rowIndexes) {
            for (const j of colIndexes) {
                const squareId = `${letters[j]}${numbers[i]}`;
                const isLightSquare = (i + j) % 2 === 0;
                const showRank = j === colIndexes[0];
                const showFile = i === rowIndexes[rowIndexes.length - 1];
                const isCheckedKing = isInCheck && (
                    (isWhite && board[i][j] === 'K')
                    || (!isWhite && board[i][j] === 'k')
                );
                squares.push(
                    <div
                        key={squareId}
                        id={squareId}
                        className={`board-square relative aspect-square w-full flex items-center justify-center transition-effect ${
                            darkMode
                                ? isLightSquare ? 'board-square-night-light' : 'board-square-night-dark'
                                : isLightSquare ? 'board-square-day-light' : 'board-square-day-dark'
                        } ${selectedPiece === squareId ? 'is-selected' : ''} ${isCheckedKing ? 'is-king-in-check' : ''} ${shouldRotate ? 'rotate-180' : ''}`}
                        onClick={() => {
                            handleSquareClick(squareId);
                        }}
                    >
                        {board[i][j] && <Piece type={board[i][j]} id={`${letters[j]}${numbers[i]}`} />}
                        {showRank && (
                            <span aria-hidden="true" className="board-coordinate left-1 top-0.5">
                                {squareId[1]}
                            </span>
                        )}
                        {showFile && (
                            <span aria-hidden="true" className="board-coordinate bottom-0 right-1">
                                {squareId[0]}
                            </span>
                        )}
                    </div>
                );
            }
        }
        return squares;
    }

    createBoard();

    const handlePromotionComplete = (piece: string) => {
        if (promotionResolved) {
            promotionResolved(piece);
            setPromotionResolved(null);
            setShowPromotionDiv(false);
        }
    };

    const handleCheckMateComplete = async () => {
        if (mode === 'online' && gameData?.id) {
            const resultValue = isDrawState ? 'draw' : (isWhite ? 'black' : 'white');
            const winnerId = isDrawState ? null : (isWhite ? gameData.guest_id : gameData.host_id);
            await supabase
                .from('games')
                .update({ status: 'complete', winner_id: winnerId, result: resultValue })
                .eq('id', gameData.id);
        }
        setShowCheckMateDiv(false);
        setIsDrawState(false);
    };

    const handleMovesComplete = () => {
        setShowMovesDiv(false);
    };

    const handleTimerComplete = async () => {
        if (mode === 'online' && gameData?.id && isGameOver) {
            const resultValue = isGameOver as 'white' | 'black';
            const winnerId = resultValue === 'white' ? gameData.host_id : gameData.guest_id;
            await supabase
                .from('games')
                .update({ status: 'complete', winner_id: winnerId, result: resultValue })
                .eq('id', gameData.id);
        }
        setTimerDiv(false);
    };
    return (
        <>
            <Sidebar />
            {isInCheck && <div aria-hidden="true" className="check-border-overlay" />}

            <div className="flex min-h-screen p-4 md:p-8 lg:p-12">
                {/* Sezione giocatori a sinistra */}
                {mode === "online" && (
                    <div className="flex flex-col justify-center gap-8 md:-mr-44 -min-w-[300px] md:min-w-[100px]">

                        {/* Nero */}
                        <div className="flex flex-col items-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={guestUser?.avatar || "/default-avatar.png"}
                                alt="Nero"
                                className={`w-14 h-14 rounded-full border-4 ${!isWhite ? 'border-yellow-400' : 'border-gray-300'}`}
                            />
                            <span className="mt-1 font-semibold text-gray-700">Nero</span>
                            <span className="text-xs text-white">{guestUser?.username || guestUser?.email || gameData?.guest_id}</span>
                        </div>

                        <span className="text-3xl font-bold text-white text-center">vs</span>

                        {/* Bianco */}
                        <div className="flex flex-col items-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={hostUser?.avatar || "/default-avatar.png"}
                                alt="Bianco"
                                className={`w-14 h-14 rounded-full border-4 ${isWhite ? 'border-yellow-400' : 'border-gray-300'}`}
                            />
                            <span className="mt-1 font-semibold text-gray-700">Bianco</span>
                            <span className="text-xs text-white">{hostUser?.username || hostUser?.email || gameData?.host_id}</span>
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
                        <PromotionModal onPromotionComplete={handlePromotionComplete} isWhite={isWhite} />
                    )}
                    {showCheckMateDiv && (
                        <CheckMateModal onCheckMateComplete={handleCheckMateComplete} isWhite={isWhite} isChallenge={mode === 'challenge'} isDraw={isDrawState} />
                    )}
                    {showTimerDiv && (check_moves ?? 0) <= 0 && (
                        <TimerModal onTimerComplete={handleTimerComplete} isWhite={isWhite} />
                    )}
                    {showMovesDiv && (
                        <MovesModal onMovesComplete={handleMovesComplete} />
                    )}
                    {(check_moves ?? 0) <= 0 && <ChessTimer isWhite={isWhite} initialTime={time} role={role} />}
                    {mode === 'ai' && (cpuMoveInProgress || stockfishSource === 'local-fallback') && (
                        <div
                            role="status"
                            aria-live="polite"
                            className={`absolute left-1/2 top-4 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold shadow-lg backdrop-blur-md ${
                                darkMode
                                    ? 'border-white/10 bg-slate-900/85 text-white'
                                    : 'border-emerald-200 bg-white/90 text-emerald-800'
                            }`}
                        >
                            {cpuMoveInProgress ? (
                                <>
                                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                                    {t.stockfishThinking}
                                </>
                            ) : (
                                <>
                                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                    {t.stockfishFallback}
                                </>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col items-center w-full max-w-[95vh] lg:max-w-[85vh] md:max-h-[85vh] xl:max-w-[86vh] mx-auto md:items-start lg:-translate-x-32 gap-3">
                        {mode === 'ai' && (
                            <div className={`flex items-center gap-2 self-center rounded-full border px-4 py-2 text-xs font-black shadow-lg backdrop-blur-md md:self-start ${
                                darkMode
                                    ? 'border-violet-400/20 bg-slate-900/75 text-violet-200'
                                    : 'border-violet-200 bg-white/80 text-violet-800'
                            }`}>
                                <span className="h-2 w-2 rounded-full bg-violet-500" />
                                {t.stockfishDifficulty}: {t[stockfishLevel.key]} · {stockfishDifficulty}/5
                            </div>
                        )}
                        {/* Scacchiera */}
                        <div
                            className={`board-frame relative w-full aspect-square rounded-[1.4rem] border-[clamp(8px,1.6vw,16px)] p-0 shadow-2xl ${
                                darkMode
                                    ? 'border-slate-800 bg-slate-950'
                                    : 'border-[#5d3827] bg-[#3f2419]'
                            }`}
                        >
                            <div className="absolute inset-0 grid-chess grid-cols-8 grid-rows-8 overflow-hidden rounded-[0.45rem]">
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
