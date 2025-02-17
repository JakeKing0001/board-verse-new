export async function fetchStockfishData(fen: string, depth: number) {
  try {
    const response = await fetch(`https://stockfish.online/api/s/v2.php?fen=${fen}&depth=${depth}`);
    if (!response.ok) {
      throw new Error(`Errore HTTP! Status: ${response.status}`);
    }
    return response.json(); // Directly return the promise
  } catch (error) {
    console.error("Errore nella fetch:", error);
    return null;
  }
}
