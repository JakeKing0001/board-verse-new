import { useEffect, useState } from "react";
import { fetchStockfishData } from "../stockFishUtils";

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
  interface StockfishData {
    bestmove: string;
    [key: string]: string;
  }

  const [data, setData] = useState<StockfishData | null>(null);

  useEffect(() => {
    fetchStockfishData(s, n).then(setData);
  }, [s, n]);

  const str = data?.bestmove ? JSON.stringify(data.bestmove, null, 2) : "";
  const bestmove = str ? str.split(" ")[1] : "No best move available";

  return (
    <div className="z-50">
      <h1>Stockfish API Response</h1>
      <pre>{bestmove}</pre>
    </div>
  );
};

export default StockfishComponent;
