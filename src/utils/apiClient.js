import { getApiUrl } from '../config/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const error = new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
};

const apiClient = {
  async get(path) {
    try {
      console.log('Making GET request to:', getApiUrl(`api/${path}`));
      const response = await fetch(getApiUrl(`api/${path}`), {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async post(path, data) {
    try {
      console.log('Making POST request to:', getApiUrl(`api/${path}`), 'with data:', data);
      const response = await fetch(getApiUrl(`api/${path}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async put(path, data) {
    try {
      console.log('Making PUT request to:', getApiUrl(`api/${path}`), 'with data:', data);
      const response = await fetch(getApiUrl(`api/${path}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async delete(path) {
    try {
      console.log('Making DELETE request to:', getApiUrl(`api/${path}`));
      const response = await fetch(getApiUrl(`api/${path}`), {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

export default apiClient;
