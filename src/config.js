// App configuration
// API base URL used for booking and distance requests.
// Set VITE_API_URL at build time for production; falls back to local dev backend.
export const API_URL = import.meta.env.VITE_API_URL || 'http://34.148.97.95:8000';

// Google Maps JS API key for address autocomplete. Client-exposed by design —
// MUST be referrer-restricted in the Google Cloud console.
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
