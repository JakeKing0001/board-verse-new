"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { PieceProvider } from "../components/PieceContext";
import App from "../components/App";

export default function ChessboardPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "defaultMode";
  const time = parseInt(searchParams.get("time") || "0", 10);

  return (
    <PieceProvider>
      <App mode={mode} time={time} />
    </PieceProvider>
  );
}
