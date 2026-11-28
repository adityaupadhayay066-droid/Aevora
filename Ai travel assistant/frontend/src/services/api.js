import axios from 'axios';

/**
 * Authoritative API client for TravelIQ
 * Points to the Node.js Express 5 backend server.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach bearer token if stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('traveliq_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  // Get current logged-in user session
  getMe: async () => {
    return api.get('/auth/me');
  },

  // Log in with email & password
  login: async ({ email, password }) => {
    return api.post('/auth/login', { email, password });
  },

  // Register new user
  register: async ({ name, email, password, phone }) => {
    return api.post('/auth/register', { name, email, password, phone });
  },

  // End active session
  logout: async () => {
    return api.post('/auth/logout');
  },
};

export const travelApi = {
  // Search verified multimodal travel routes
  searchRoutes: async ({ source, destination, departureDate, transportMode = 'all', passengers = 1 }) => {
    return api.post('/travel/routes/search', {
      source,
      destination,
      departureDate,
      transportMode,
      passengers,
    });
  },

  // Check backend service health
  checkHealth: async () => {
    return api.get('/health');
  },
};

export default api;
