/**
 * Sends a friend request from the sender to the receiver by making a POST request to the `/api/friend` endpoint.
 *
 * @param formData - An object containing the IDs of the sender and receiver.
 * @param formData.senderID - The ID of the user sending the friend request.
 * @param formData.receiverID - The ID of the user receiving the friend request.
 * @returns A promise that resolves to the JSON response from the server.
 * @throws Will throw an error if the network response is not ok.
 */
export const setRequests = async (formData: { senderID: number; receiverID: number }) => {
    const { getApiHeaders } = await import('../lib/api');
    const response = await fetch(`/api/friend`, {
      method: "POST",
      headers: await getApiHeaders(),
      body: JSON.stringify(formData),
    });
  
    if (response.ok) {
      return response.json();
    }
    
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
};

/**
 * Fetches the list of friend requests from the `/api/friend` endpoint.
 *
 * @returns {Promise<any>} A promise that resolves to the JSON response containing friend requests.
 * @throws {Error} Throws an error if the network response is not ok.
 */
export const getRequests = async (): Promise<FriendRequest[]> => {
    const { getApiHeaders } = await import('../lib/api');
    const response = await fetch(`/api/friend`, {
      method: "GET",
      headers: await getApiHeaders(),
    });
  
    if (response.ok) {
      return response.json();
    }
    
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
}

/**
 * Sends a DELETE request to the `/api/friend` endpoint to delete a friend request.
 *
 * @param formData - An object containing the `id` of the friend request to delete.
 * @returns A promise that resolves to the JSON response from the server.
 * @throws Will throw an error if the response is not OK.
 */
export const deleteRequests = async (formData: { id: number }) => {
    const { getApiHeaders } = await import('../lib/api');
    const response = await fetch(`/api/friend`, {
      method: "DELETE",
      headers: await getApiHeaders(),
      body: JSON.stringify(formData),
    });
  
    if (response.ok) {
      return response.json();
    }
    
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
};

/**
 * Sends a POST request to the `/api/friendAccepted` endpoint to set a friendship between two users.
 *
 * @param formData - An object containing the IDs of the user and the friend.
 * @param formData.userID - The ID of the user initiating the friend request.
 * @param formData.friendID - The ID of the user being added as a friend.
 * @returns A promise that resolves to the JSON response from the server.
 * @throws Will throw an error if the network response is not ok.
 */
export const setFriends = async (formData: { userID: number; friendID: number }) => {
    const { getApiHeaders } = await import('../lib/api');
    const response = await fetch(`/api/friendAccepted`, {
      method: "POST",
      headers: await getApiHeaders(),
      body: JSON.stringify(formData),
    });
  
    if (response.ok) {
      return response.json();
    }
    
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
};

/**
 * Fetches the list of accepted friends from the `/api/friendAccepted` endpoint.
 *
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the list of accepted friends.
 * @throws {Error} Throws an error if the network response is not ok.
 */
export const getFriends = async (): Promise<Friendship[]> => {
    const { getApiHeaders } = await import('../lib/api');
    const response = await fetch(`/api/friendAccepted`, {
      method: "GET",
      headers: await getApiHeaders(),
    });
  
    if (response.ok) {
      return response.json();
    }
    
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
}

/**
 * Deletes a friend relationship between two users.
 *
 * Sends a DELETE request to the `api/friendAccepted` endpoint with the provided user and friend IDs.
 *
 * @param params - An object containing the IDs of the user and the friend to be deleted.
 * @param params.user_id - The ID of the user (optional).
 * @param params.friend_id - The ID of the friend (optional).
 * @returns A promise that resolves when the friend relationship is successfully deleted.
 * @throws Will throw an error if the request fails.
 */
export const deleteFriends = async (params: { user_id?: number, friend_id?: number }): Promise<void> => {
  const url = `/api/friendAccepted`;
  const { getApiHeaders } = await import('../lib/api');

  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: await getApiHeaders(),
    body: JSON.stringify({ 
      user_id: params.user_id, 
      friend_id: params.friend_id 
    }),
  });
  
  if (response.ok) {
    return;
  }
  throw new Error('Failed to delete friend');
};
import type { FriendRequest, Friendship } from '../src/types/domain';
