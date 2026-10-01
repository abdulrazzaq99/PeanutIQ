// Base URL for the FastAPI backend. Production builds read VITE_API_URL from .env.production
// (the backend deployed on Vercel); local development falls back to the local backend.
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/+$/, '');

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
