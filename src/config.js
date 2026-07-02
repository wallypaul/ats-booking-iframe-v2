// App configuration
// API base URL used for booking and distance requests.
// Set VITE_API_URL at build time for production; falls back to local dev backend.
export const API_URL = import.meta.env.VITE_API_URL || 'http://34.148.97.95:8000';

// Google Maps JS API key for address autocomplete. Client-exposed by design —
// MUST be referrer-restricted in the Google Cloud console.
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// ATS iframe identity. iframe_uuid names this iframe → the payer that owns it;
// the backend uses it to resolve service levels and attribute quotes + bookings.
// It's a PUBLIC identifier (client env vars ship to the browser), not a secret.
// apiBase reuses VITE_API_URL — same backend, no second base-URL var needed.
// ponytail: apiBase = API_URL, split into VITE_ATS_API_BASE only if they diverge.
export const ATS = {
  source: import.meta.env.VITE_ATS_SOURCE || 'iframe',
  iframeUuid: import.meta.env.VITE_ATS_IFRAME_UUID || '',
  apiBase: API_URL,
};
