import { useEffect, useRef } from 'react';
import { TextField } from '@mui/material';
import { loadGoogleMaps } from '../loadGoogleMaps';

// TextField with Google Places address suggestions. Writes the picked address
// back through onChange, so it behaves like a normal controlled input.
// ponytail: uses the legacy places.Autocomplete widget (deprecated Mar 2025 but
// still works and styles cleanly inside MUI). Swap to PlaceAutocompleteElement
// only if Google drops it.
export default function AddressField({ value, onChange, ...props }) {
  const inputRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let ac;
    loadGoogleMaps()
      .then(() => {
        if (!inputRef.current) return;
        ac = new window.google.maps.places.Autocomplete(inputRef.current, {
          fields: ['formatted_address'],
        });
        ac.addListener('place_changed', () => {
          const addr = ac.getPlace()?.formatted_address;
          if (addr) onChangeRef.current({ target: { value: addr } });
        });
      })
      .catch(() => {}); // no key / network: field still works as plain text input
    return () => ac && window.google?.maps?.event.clearInstanceListeners(ac);
  }, []);

  return <TextField inputRef={inputRef} value={value} onChange={onChange} {...props} />;
}
