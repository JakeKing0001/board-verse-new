"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PieceProvider } from "../components/PieceContext";
import App from "../components/App";

function ChessboardPageContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "defaultMode";
  const time = parseInt(searchParams.get("time") || "0", 10);
  const fen_challenge = searchParams.get("fen_challenge") || "defaultFen";
  const check_moves = parseInt(searchParams.get("check_moves") || "0", 10);

  return <App mode={mode} time={time} fen_challenge={fen_challenge} check_moves={check_moves} />;
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
