import axios from 'axios';

/**
 * Authoritative API client for TravelIQ
 * Points to the Node.js Express 5 backend server.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
