export const setChallengeComplete = async (formData: { userID: number; challengeID: number }) => {
    const response = await fetch(`/api/challengeComplete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
  
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
  
    return response.json();
  };

export const getChallengeComplete = async () => {
    const response = await fetch(`/api/challengeComplete`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
  
    return response.json();
  };