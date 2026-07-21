export interface UserStatistics {
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  challengesCompleted: number;
}

export const getStatistics = async (userID: number): Promise<UserStatistics> => {
  const { getApiHeaders } = await import('../lib/api');
  const response = await fetch(`/api/statistics?userId=${userID}`, {
    method: 'GET',
    headers: await getApiHeaders(),
  });

  if (response.ok) {
    return response.json();
  }

  throw new Error(`Error: ${response.status} - ${response.statusText}`);
};
