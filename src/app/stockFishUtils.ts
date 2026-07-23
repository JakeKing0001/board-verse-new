export interface StockfishData {
  success: boolean;
  source: 'stockfish' | 'local-fallback';
  move: string;
  bestmove: string;
  evaluation: number | null;
  mate: number | null;
  continuation: string;
  warning?: string;
}

interface StockfishError {
  success?: false;
  error?: string;
}

export async function fetchStockfishData(
  fen: string,
  depth: number,
  signal?: AbortSignal,
): Promise<StockfishData> {
  const searchParams = new URLSearchParams({
    fen,
    depth: String(Math.min(15, Math.max(1, Math.trunc(depth)))),
  });
  const response = await fetch(`/api/stockfish?${searchParams.toString()}`, {
    cache: 'no-store',
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
    signal,
  });
  const payload = await response.json() as StockfishData | StockfishError;

  if (!response.ok || !payload.success || !('move' in payload)) {
    const errorMessage = 'error' in payload ? payload.error : undefined;
    throw new Error(errorMessage || `Analisi Stockfish non disponibile (${response.status})`);
  }

  return payload;
}
