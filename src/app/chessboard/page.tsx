"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PieceProvider } from "../components/PieceContext";
import App from "../components/App";

function ChessboardPageContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "defaultMode";
  const time = parseInt(searchParams.get("time") || "0", 10);

  return <App mode={mode} time={time} />;
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
