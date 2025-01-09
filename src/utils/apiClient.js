import { getApiUrl } from '../config/api';

const defaultHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

const defaultOptions = {
  credentials: 'include',
  headers: defaultHeaders,
  mode: 'cors'
};

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
      // Remove 'api/' if it's already in the path
      const cleanPath = path.replace(/^api\//, '');
      const url = new URL(getApiUrl(cleanPath));
      
      if (params) {
        Object.keys(params).forEach(key => 
          url.searchParams.append(key, params[key])
        );
      }
      console.log('Making GET request to:', url.toString());
      const response = await fetch(url.toString(), {
        ...defaultOptions,
        method: 'GET'
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async post(path, data) {
    try {
      const cleanPath = path.replace(/^api\//, '');
      const url = getApiUrl(cleanPath);
      console.log('Making POST request to:', url, 'with data:', data);
      const response = await fetch(url, {
        ...defaultOptions,
        method: 'POST',
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
      const cleanPath = path.replace(/^api\//, '');
      const url = getApiUrl(cleanPath);
      console.log('Making PUT request to:', url, 'with data:', data);
      const response = await fetch(url, {
        ...defaultOptions,
        method: 'PUT',
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
      const cleanPath = path.replace(/^api\//, '');
      const url = getApiUrl(cleanPath);
      console.log('Making DELETE request to:', url);
      const response = await fetch(url, {
        ...defaultOptions,
        method: 'DELETE'
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

export default apiClient;
