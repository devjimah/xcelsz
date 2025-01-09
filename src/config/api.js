const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://xcelsz.onrender.com';

export const getApiUrl = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_URL}/${cleanPath}`;
};
