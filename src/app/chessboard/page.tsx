"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import App from "../components/App";
import { supabase } from "../../../lib/supabase";
import type { GameSummary } from "../../types/domain";


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
  const mode = searchParams.get("mode") || "defaultMode";
  const gameId = searchParams.get("gameId") || "";
  const time = parseInt(searchParams.get("time") || "0", 10);
  const fen_challenge = searchParams.get("fen_challenge") || "defaultFen";
  const check_moves = parseInt(searchParams.get("check_moves") || "0", 10);

  const [game, setGame] = useState<GameSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "online" && gameId) {
      const fetchGame = async () => {
        const { data, error } = await supabase.from("games").select("*").eq("id", gameId).single();
        if (error || !data) {
          setLoadError("Partita non trovata o non accessibile.");
          return;
        }
        setGame(data as GameSummary);
      };
      fetchGame();

      const channel = supabase
        .channel("game-listen")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameId}` },
          (payload) => {
            setGame(payload.new as GameSummary);
          }
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "games", filter: `id=eq.${gameId}` },
          (payload) => {
            setGame(payload.new as GameSummary);
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
        const { data } = await supabase.from("games").select("*").eq("id", gameId).single();
        if (data && data.guest_id) {
          setGame(data as GameSummary);
          clearInterval(interval);
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, gameId, game]);

  if (mode === "online" && loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-center text-white">
        <div className="max-w-md rounded-3xl border border-red-400/20 bg-slate-900 p-8 shadow-2xl">
          <h2 className="text-2xl font-bold">Impossibile aprire la partita</h2>
          <p className="mt-3 text-slate-300">{loadError}</p>
        </div>
      </div>
    );
  }

  if (mode === "online" && game && !game.guest_id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-emerald-400/30 border-t-emerald-400" />
          <h2 className="text-2xl font-bold">In attesa di un avversario</h2>
          <p className="mt-2 text-slate-300">La scacchiera si aprirà automaticamente appena entra il secondo giocatore.</p>
          {game.is_private && game.join_code && (
            <div className="mt-6 rounded-2xl bg-slate-800 p-4 text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Codice invito</span>
              <div className="mt-2 flex items-center gap-3">
                <code className="min-w-0 flex-1 break-all text-sm">{game.join_code}</code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(game.join_code!)}
                  className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-900"
                >
                  Copia
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === "online" && !game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Caricamento partita...</h2>
        <p>Attendi che entrambi i giocatori siano pronti.</p>
      </div>
    );
  }

  return <App mode={mode} time={game?.time ?? time} fen_challenge={fen_challenge} check_moves={check_moves} gameData={game ?? undefined} />;
}

export default function ChessboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChessboardPageContent />
    </Suspense>
  );
}
