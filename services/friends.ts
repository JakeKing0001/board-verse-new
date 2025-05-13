export const setRequests = async (formData: { senderID: number; receiverID: number }) => {
    const response = await fetch(`/api/friend`, {
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

export const getRequests = async () => {
    const response = await fetch(`/api/friend`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
  
    return response.json();
}

export const deleteRequests = async (formData: { id: number }) => {
    const response = await fetch(`/api/friend`, {
      method: "DELETE",
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

export const setFriends = async (formData: { userID: number; friendID: number }) => {
    const response = await fetch(`/api/friendAccepted`, {
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

export const getFriends = async () => {
    const response = await fetch(`/api/friendAccepted`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
  
    return response.json();
}

export const deleteFriends = async (params: { user_id?: number, friend_id?: number }): Promise<void> => {
  let url = `api/friendAccepted`;

  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      user_id: params.user_id, 
      friend_id: params.friend_id 
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete friend');
  }
};