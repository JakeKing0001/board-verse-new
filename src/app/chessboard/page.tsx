"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PieceProvider } from "../components/PieceContext";
import App from "../components/App";
import { supabase } from "../../../lib/supabase";


/**
 * Renders the main content for the chessboard page, handling different game modes and loading states.
 *
 * This component:
 * - Reads query parameters from the URL to determine the game mode, game ID, time, FEN challenge, and check moves.
 * - For online games, fetches the game data from Supabase and subscribes to real-time updates for the game.
 * - Polls for a guest player to join if the game is waiting for an opponent.
 * - Displays appropriate loading or waiting messages based on the game state.
 * - Renders the main `App` component with the relevant props once the game is ready.
 *
 * @returns {JSX.Element} The rendered chessboard page content, including loading and waiting states.
 */
function ChessboardPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = searchParams.get("mode") || undefined;
  const gameId = searchParams.get("gameId") || undefined;
  const timeParam = searchParams.get("time");
  const time = timeParam ? parseInt(timeParam, 10) : NaN;
  const fen_challenge = searchParams.get("fen_challenge") || undefined;
  const checkMovesParam = searchParams.get("check_moves");
  const check_moves = checkMovesParam ? parseInt(checkMovesParam, 10) : NaN;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [game, setGame] = useState<any>(null);

  // Redirect to setup pages if required parameters are missing
  useEffect(() => {
    const allowedModes = ["multiplayer", "ai", "online", "challenge"];

    if (!mode || !allowedModes.includes(mode)) {
      router.replace("/gameMode");
      return;
    }

    if (["multiplayer", "ai", "online"].includes(mode) && (!timeParam || isNaN(time))) {
      router.replace("/chooseTime");
      return;
    }

    if (mode === "online" && !gameId) {
      router.replace("/online");
      return;
    }

    if (mode === "challenge" && (!fen_challenge || !checkMovesParam)) {
      router.replace("/challenge");
    }
  }, [mode, timeParam, time, gameId, fen_challenge, checkMovesParam, router]);

  useEffect(() => {
    if (mode === "online" && gameId) {
      const fetchGame = async () => {
        const { data } = await supabase.from("games").select("*").eq("id", gameId).single();
        setGame(data); 
      };
      fetchGame();

      const channel = supabase
        .channel("game-listen")
        .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameId}` },
            (payload) => {
              setGame(payload.new);
            }
        )
        .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "games", filter: `id=eq.${gameId}` },
            (payload) => {
              setGame(payload.new);
            }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [mode, gameId]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (mode === "online" && gameId && (!game || !game.guest_id)) {
      interval = setInterval(async () => {
        const { data} = await supabase.from("games").select("*").eq("id", gameId).single();
        if (data && data.guest_id) {
          setGame(data);
          clearInterval(interval);
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, gameId, game]);

  const invalidParams =
    !mode ||
    ["multiplayer", "ai", "online", "challenge"].indexOf(mode) === -1 ||
    (["multiplayer", "ai", "online"].includes(mode) && (!timeParam || isNaN(time))) ||
    (mode === "online" && !gameId) ||
    (mode === "challenge" && (!fen_challenge || !checkMovesParam));

  if (invalidParams) {
    return <div className="flex items-center justify-center h-screen">Invalid game parameters</div>;
  }

  if (
    mode === "online" &&
    game &&
    (game.guest_id === null || game.guest_id === undefined)
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">In attesa di un avversario...</h2>
        <p>Condividi il link per far entrare un altro giocatore.</p>
      </div>
    );
  }

  if (mode === "online" && (!game || !game.host_id || !game.guest_id)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Caricamento partita...</h2>
        <p>Attendi che entrambi i giocatori siano pronti.</p>
      </div>
    );
  }

  return <App mode={mode} time={time} fen_challenge={fen_challenge ?? ""} check_moves={check_moves} gameData={game} />;
}

export default function ChessboardPage() {
  return (
    <PieceProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <ChessboardPageContent />
      </Suspense>
    </PieceProvider>
  );
}
