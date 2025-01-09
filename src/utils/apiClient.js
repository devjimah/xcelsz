import { getApiUrl } from '../config/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const error = new Error(errorData?.error || errorData?.message || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.details = errorData?.details;
    throw error;
  }
  return response.json();
};

const apiClient = {
  async get(path, params) {
    try {
      const url = new URL(getApiUrl(`api/${path}`));
      if (params) {
        Object.keys(params).forEach(key => 
          url.searchParams.append(key, params[key])
        );
      }
      console.log('Making GET request to:', url.toString());
      const response = await fetch(url.toString(), {
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
      const url = getApiUrl(`api/${path}`);
      console.log('Making POST request to:', url, 'with data:', data);
      const response = await fetch(url, {
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

  async put(path, data, params) {
    try {
      const url = new URL(getApiUrl(`api/${path}`));
      if (params) {
        Object.keys(params).forEach(key => 
          url.searchParams.append(key, params[key])
        );
      }
      console.log('Making PUT request to:', url.toString(), 'with data:', data);
      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: data ? JSON.stringify(data) : null,
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async delete(path, params) {
    try {
      const url = new URL(getApiUrl(`api/${path}`));
      if (params) {
        Object.keys(params).forEach(key => 
          url.searchParams.append(key, params[key])
        );
      }
      console.log('Making DELETE request to:', url.toString());
      const response = await fetch(url.toString(), {
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
