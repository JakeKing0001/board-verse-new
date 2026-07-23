import { getApiHeaders } from '../lib/api';
import type { GameCursor, GameSummary } from '../src/types/domain';

interface GamesPage {
  games: GameSummary[];
  nextCursor: GameCursor | null;
}

const parseJson = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }
  return data as T;
};

export const getRecentGames = async (
  before?: GameCursor | null,
): Promise<GamesPage> => {
  const params = new URLSearchParams({ limit: '30' });
  if (before) {
    params.set('beforeCreatedAt', before.createdAt);
    params.set('beforeId', String(before.id));
  }

  const response = await fetch(`/api/games?${params.toString()}`, {
    headers: await getApiHeaders(),
    cache: 'no-store',
  });
  return parseJson<GamesPage>(response);
};

export const createGame = async (input: {
  name: string;
  time: number;
  isPrivate: boolean;
}): Promise<GameSummary> => {
  const response = await fetch('/api/games', {
    method: 'POST',
    headers: await getApiHeaders(),
    body: JSON.stringify(input),
  });
  return parseJson<GameSummary>(response);
};

export const joinGame = async (input: {
  gameId?: string;
  joinCode?: string;
}): Promise<GameSummary> => {
  const response = await fetch('/api/games/join', {
    method: 'POST',
    headers: await getApiHeaders(),
    body: JSON.stringify(input),
  });
  return parseJson<GameSummary>(response);
};

export const submitGameMove = async (
  gameId: string,
  input: { from: string; to: string; promotion?: string },
): Promise<unknown> => {
  const response = await fetch(`/api/games/${gameId}/moves`, {
    method: 'POST',
    headers: await getApiHeaders(),
    body: JSON.stringify(input),
  });
  return parseJson<unknown>(response);
};
