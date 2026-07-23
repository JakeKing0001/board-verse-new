import { useEffect, useState } from "react";
import {
  fetchStockfishData,
  type StockfishData,
} from "../stockFishUtils";

/**
 * React component that fetches and displays the best move from the Stockfish chess engine API.
 *
 * @param s - The FEN string representing the current chess board state.
 * @param n - The depth or number of moves to analyze.
 *
 * @remarks
 * - Uses `fetchStockfishData` to retrieve Stockfish analysis based on the provided FEN and depth.
 * - Displays the best move suggested by Stockfish, or a fallback message if unavailable.
 */
const StockfishComponent = ({ s, n }: { s: string; n: number }) => {
  const [data, setData] = useState<StockfishData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);

    fetchStockfishData(s, n, controller.signal)
      .then(setData)
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        setError(reason instanceof Error ? reason.message : 'Analisi non disponibile');
      });

    return () => controller.abort();
  }, [s, n]);

  return (
    <div className="z-50" aria-live="polite">
      <h1>Stockfish</h1>
      <pre>{error || data?.move || "Analisi in corso…"}</pre>
    </div>
  );
};

export default StockfishComponent;
