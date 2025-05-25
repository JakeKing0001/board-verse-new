"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PieceProvider } from "../components/PieceContext";
import App from "../components/App";
import { supabase } from "../../../lib/supabase";


function ChessboardPageContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "defaultMode";
  const gameId = searchParams.get("gameId") || "";
  const time = parseInt(searchParams.get("time") || "0", 10);
  const fen_challenge = searchParams.get("fen_challenge") || "defaultFen";
  const check_moves = parseInt(searchParams.get("check_moves") || "0", 10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [game, setGame] = useState<any>(null);

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

  if (mode === "online" && game && (!game.guest_id || !game.guest_id === null)) {
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

  return <App mode={mode} time={time} fen_challenge={fen_challenge} check_moves={check_moves} gameData={game} />;
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
