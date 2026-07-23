/**
 * Sends a new message to the authenticated user's friend.
 *
 * @param formData - An object containing the receiver's ID and message text.
 * @param formData.receiverID - The ID of the user receiving the message.
 * @param formData.text - An object containing the message text.
 * @param formData.text.text - The actual message content as a string.
 * @returns A promise that resolves to the JSON response from the server.
 * @throws Will throw an error if the server response is not OK.
 */
export const setMessages = async (formData: { receiverID: number; text: { text: string } }): Promise<ChatMessage> => {
  const { getApiHeaders } = await import('../lib/api');
  const response = await fetch(`/api/messages`, {
    method: "POST",
    headers: await getApiHeaders(),
    body: JSON.stringify(formData),
  });

  if (response.ok) {
    return response.json();
  }
  
  throw new Error(`Error: ${response.status} - ${response.statusText}`);
};

export const markMessagesRead = async (senderID: number): Promise<void> => {
  const { getApiHeaders } = await import('../lib/api');
  const response = await fetch('/api/messages', {
    method: 'PATCH',
    headers: await getApiHeaders(),
    body: JSON.stringify({ senderID }),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }
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
export const getMessages = async (
  friendId: number,
  cursor?: MessageCursor | null,
): Promise<PaginatedMessages> => {
  const { getApiHeaders } = await import('../lib/api');
  const params = new URLSearchParams({
    friendId: String(friendId),
    limit: '50',
  });
  if (cursor) {
    params.set('beforeSentAt', cursor.sentAt);
    params.set('beforeId', String(cursor.id));
  }

  const response = await fetch(`/api/messages?${params.toString()}`, {
    method: "GET",
    headers: await getApiHeaders(),
    cache: 'no-store',
  });

  if (response.ok) {
    return response.json();
  }
  
  throw new Error(`Error: ${response.status} - ${response.statusText}`);
};
/**
 * Verifies that the authenticated user can start chatting with a friend.
 *
 * @param formData - Object containing the friend's ID.
 * @returns A promise resolving with the API response.
 */
export const createConversation = async (formData: { friendID: number }) => {
  const { getApiHeaders } = await import('../lib/api');
  const response = await fetch(`/api/conversations`, {
    method: "POST",
    headers: await getApiHeaders(),
    body: JSON.stringify(formData),
  });

  if (response.ok) {
    return response.json();
  }
  
  throw new Error(`Error: ${response.status} - ${response.statusText}`);
};

export const getConversationSummaries = async (): Promise<ConversationSummary[]> => {
  const { getApiHeaders } = await import('../lib/api');
  const response = await fetch('/api/conversations', {
    headers: await getApiHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }

  const payload = await response.json() as { conversations?: ConversationSummary[] };
  return payload.conversations ?? [];
};
import type {
  ChatMessage,
  ConversationSummary,
  MessageCursor,
  PaginatedMessages,
} from '../src/types/domain';
