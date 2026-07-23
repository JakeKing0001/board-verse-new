export type ChallengeDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface ChessChallenge {
  id: number;
  fen: string;
  number_moves: number;
  cpu_moves: string[] | null;
  created_at: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  theme: string;
  rating: number;
  hint: string | null;
  sort_order: number | null;
}

export const getChallenge = async (): Promise<ChessChallenge[]> => {
  const { getApiHeaders } = await import('../lib/api');
  const response = await fetch('/api/challenge', {
    method: 'GET',
    headers: await getApiHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Errore: ${response.status} - ${response.statusText}`);
  }

  return response.json();
};
