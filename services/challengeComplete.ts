export interface CompletedChallenge {
  user_id: number;
  challenge_id: number;
}

export const setChallengeComplete = async (challengeID: number) => {
  const { getApiHeaders } = await import('../lib/api');
  const response = await fetch('/api/challengeComplete', {
    method: 'POST',
    headers: await getApiHeaders(),
    body: JSON.stringify({ challengeID }),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }

  return response.json();
};

export const getChallengeComplete = async (): Promise<CompletedChallenge[]> => {
  const { getApiHeaders } = await import('../lib/api');
  const response = await fetch('/api/challengeComplete', {
    method: 'GET',
    headers: await getApiHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }

  return response.json();
};
