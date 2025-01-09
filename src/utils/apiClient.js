import { getApiUrl } from '../config/api';

const apiClient = {
  async get(path) {
    const response = await fetch(getApiUrl(`api/${path}`));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async post(path, data) {
    const response = await fetch(getApiUrl(`api/${path}`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async put(path, data) {
    const response = await fetch(getApiUrl(`api/${path}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async delete(path) {
    const response = await fetch(getApiUrl(`api/${path}`), {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};

export default apiClient;
