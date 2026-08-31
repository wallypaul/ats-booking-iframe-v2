import { GOOGLE_MAPS_API_KEY } from './config';

// Injects the Google Maps JS bootstrap once; resolves with the `places` library.
//
// `loading=async` is required by PlaceAutocompleteElement's loader, and the old
// objection to it no longer applies: we no longer read google.maps.places off
// the global right after onload, we await importLibrary('places'), which is the
// documented way to know a library is actually populated.
//
// The poll is not superstition — measured against this key on Maps JS 3.66.2d,
// `google.maps.importLibrary` is still `undefined` in the script's own onload
// handler and appears a tick or two later. Bounded so a bad key/network rejects
// instead of hanging the caller forever.
let promise;
export function loadGoogleMaps() {
  if (promise) return promise;
  promise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`
          + '&libraries=places&loading=async&v=weekly';
    s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(s);
  }).then(async () => {
    const deadline = Date.now() + 8000;
    while (typeof window.google?.maps?.importLibrary !== 'function') {
      if (Date.now() > deadline) throw new Error('google.maps.importLibrary never appeared');
      await new Promise((r) => setTimeout(r, 50));
    }
    return window.google.maps.importLibrary('places');
  });
  return promise;
}
