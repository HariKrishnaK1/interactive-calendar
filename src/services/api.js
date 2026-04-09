const BASE_URL = 'http://localhost:8080/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Server request failed');
  }
  // Delete requests might return empty / 200 OK without JSON
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const api = {
  // Authentication
  login: async (username, password) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return handleResponse(response);
  },

  signup: async (username, password) => {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return handleResponse(response);
  },

  // Notes Management
  getNotes: async (userId) => {
    const response = await fetch(`${BASE_URL}/notes?userId=${userId}`, {
      method: 'GET'
    });
    return handleResponse(response);
  },

  saveNote: async (notePayload) => {
    // Note payload format expecting: 
    // { id?: Number, userId: Number, startDate: String, endDate?: String, note: String }
    const response = await fetch(`${BASE_URL}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notePayload)
    });
    return handleResponse(response);
  },

  deleteNote: async (noteId) => {
    const response = await fetch(`${BASE_URL}/notes/${noteId}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};
