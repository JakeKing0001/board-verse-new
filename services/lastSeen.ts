/**
 * Sends a POST request to update the user's last seen timestamp.
 *
 * @param formData - Object containing the userID of the user to update.
 */
export const updateLastSeen = async (formData: { userID: number }) => {
  await fetch(`/api/lastSeen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
};