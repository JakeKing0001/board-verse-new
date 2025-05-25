/**
 * Sends a POST request to mark a challenge as complete for a specific user.
 *
 * @param formData - An object containing the user ID and challenge ID.
 * @param formData.userID - The unique identifier of the user.
 * @param formData.challengeID - The unique identifier of the challenge.
 * @returns A promise that resolves to the JSON response from the server.
 * @throws Will throw an error if the network response is not ok.
 */
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

/**
 * Fetches the challenge completion status from the `/api/challengeComplete` endpoint.
 *
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the challenge completion data.
 * @throws {Error} Throws an error if the network response is not ok.
 */
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