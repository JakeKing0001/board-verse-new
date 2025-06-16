/**
 * Sends a new message to the server by making a POST request to the `/api/messages` endpoint.
 *
 * @param formData - An object containing the sender's ID, receiver's ID, and the message text.
 * @param formData.senderID - The ID of the user sending the message.
 * @param formData.receiverID - The ID of the user receiving the message.
 * @param formData.text - An object containing the message text.
 * @param formData.text.text - The actual message content as a string.
 * @returns A promise that resolves to the JSON response from the server.
 * @throws Will throw an error if the server response is not OK.
 */
export const setMessages = async (formData: { senderID: number; receiverID: number; text: { text: string } }) => {
  const response = await fetch(`/api/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (response.ok) {
    return response.json();
  }
  
  throw new Error(`Error: ${response.status} - ${response.statusText}`);
};

/**
 * Fetches messages from the `/api/messages` endpoint.
 *
 * Sends a GET request to retrieve messages in JSON format.
 * Throws an error if the response is not successful.
 *
 * @returns {Promise<any>} A promise that resolves to the JSON response containing messages.
 * @throws {Error} If the network response is not ok.
 */
export const getMessages = async () => {
  const response = await fetch(`/api/messages`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    return response.json();
  }
  
  throw new Error(`Error: ${response.status} - ${response.statusText}`);
};
/**
 * Creates an empty conversation between two users.
 *
 * @param formData - Object containing the IDs of the two participants.
 * @returns A promise resolving with the API response.
 */
export const createConversation = async (formData: { userID: number; friendID: number }) => {
  const response = await fetch(`/api/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (response.ok) {
    return response.json();
  }
  
  throw new Error(`Error: ${response.status} - ${response.statusText}`);
};