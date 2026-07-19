import { GOOGLE_MAPS_API_KEY } from './config';

// Injects the Google Maps JS API (+ Places) script once; resolves when ready.
let promise;
export function loadGoogleMaps() {
  if (window.google?.maps?.places) return Promise.resolve();
  if (promise) return promise;
  promise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    // No `loading=async`: that param makes onload fire before google.maps.places
    // is actually populated (it loads the namespace in a later async step), so
    // the immediate `new google.maps.places.Autocomplete(...)` right after this
    // resolves would throw — silently, since AddressField swallows load errors.
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return promise;
}
