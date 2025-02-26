import { useEffect, useState } from "react";
import { fetchStockfishData } from "../stockFishUtils";

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
