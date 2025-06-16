/**
 * Fetches analysis data from the Stockfish online API for a given chess position in FEN notation and search depth.
 *
 * @param fen - The FEN (Forsyth-Edwards Notation) string representing the chess board position.
 * @param depth - The search depth for the Stockfish engine analysis.
 * @returns A promise that resolves to the JSON response from the Stockfish API, or `null` if an error occurs.
 *
 * @throws Will throw an error if the HTTP response is not OK.
 */
export async function fetchStockfishData(fen: string, depth: number) {
  try {
    const response = await fetch(`https://stockfish.online/api/s/v2.php?fen=${fen}&depth=${depth}`);
    if (response.ok) {
      return response.json(); // Directly return the promise
    }
    throw new Error(`Errore HTTP! Status: ${response.status}`);
  } catch (error) {
    console.error("Errore nella fetch:", error);
    return null;
  }
}
