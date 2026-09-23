// Base URL for the FastAPI backend
// In production, this should be driven by environment variables e.g., import.meta.env.VITE_API_URL
export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('peanutiq_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 503) {
    if (window.location.pathname !== '/maintenance') {
      window.location.href = '/maintenance';
    }
  }

  return response;
};
