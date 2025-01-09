const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://xcelsz.onrender.com';

export const getApiUrl = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Check if the path already includes 'api'
  const apiPath = cleanPath.startsWith('api/') ? cleanPath : `api/${cleanPath}`;
  
  // Ensure we don't duplicate 'api' in the path
  const finalPath = apiPath.replace(/\/+/g, '/');
  
  console.log('API URL:', API_URL);
  console.log('Final URL:', `${API_URL}/${finalPath}`);
  
  return `${API_URL}/${finalPath}`;
};
