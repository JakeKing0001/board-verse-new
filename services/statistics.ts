export const getStatistics = async (userID: number) => {
  const response = await fetch(`/api/statistics?userId=${userID}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (response.ok) {
    return response.json();
  }

  throw new Error(`Error: ${response.status} - ${response.statusText}`);
};