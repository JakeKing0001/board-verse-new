export interface MonthlyStatistic {
  period: string;
  matches: number;
  wins: number;
}

export interface WeeklyStatistic {
  day: string;
  matches: number;
}

export interface UserStatistics {
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  challengesCompleted: number;
  currentWinStreak: number;
  bestWinStreak: number;
  averageGameDurationSeconds: number;
  experiencePoints: number;
  ranking: number;
  totalPlayers: number;
  monthly: MonthlyStatistic[];
  weekly: WeeklyStatistic[];
}

export const emptyStatistics: UserStatistics = {
  matchesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  challengesCompleted: 0,
  currentWinStreak: 0,
  bestWinStreak: 0,
  averageGameDurationSeconds: 0,
  experiencePoints: 0,
  ranking: 1,
  totalPlayers: 1,
  monthly: [],
  weekly: [],
};

export const getStatistics = async (): Promise<UserStatistics> => {
  const { getApiHeaders } = await import('../lib/api');
  const response = await fetch('/api/statistics', {
    method: 'GET',
    headers: await getApiHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }

  return response.json();
};
