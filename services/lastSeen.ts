/**
 * Sends a POST request to update the user's last seen timestamp.
 *
 * @param formData - Object containing the userID of the user to update.
 */
export const updateLastSeen = async (formData: { userID: number }) => {
  try {
    const { getApiHeaders } = await import('../lib/api');
    const res = await fetch('/api/lastSeen', {
      method: 'POST',
      headers: await getApiHeaders(),
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error('Failed to update last seen:', data.error ?? res.statusText);
    }
  } catch (err) {
    console.error('Failed to update last seen:', err);
  }
};
