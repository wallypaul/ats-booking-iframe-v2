// App configuration
// API base URL used for booking and distance requests.
// Set VITE_API_URL at build time for production; falls back to local dev backend.
export const API_URL = import.meta.env.VITE_API_URL || 'http://34.148.97.95:8000';
