import { useEffect, useRef, useState } from 'react';
import { Box, FormHelperText, TextField } from '@mui/material';
import { loadGoogleMaps } from '../loadGoogleMaps';

// Address input with Google Places suggestions. Same props as the TextField it
// replaces, so callers stay controlled: the picked (or typed) address is pushed
// back through onChange as { target: { value } }.
//
// Uses places.PlaceAutocompleteElement — the legacy places.Autocomplete widget
// was deprecated in March 2025. The element brings its OWN input and keeps it in
// a closed shadow root, so unlike the old widget it cannot be attached to the
// MUI TextField below; the TextField is now only the fallback for when Maps
// fails to load (no key, offline), which is the same degradation as before.
//
// ponytail: the element's own chrome, not MUI's. Its internals are unreachable,
// so matching the outlined look exactly would mean dropping back to the
// AutocompleteSuggestion API and rendering suggestions in MUI ourselves.
export default function AddressField({ value, onChange, placeholder, error, helperText, ...props }) {
  const hostRef = useRef(null);
  const elRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(({ PlaceAutocompleteElement }) => {
        if (cancelled || !hostRef.current) return;
        // US-only: the rest of the form already assumes it (US phone regex, states).
        const el = new PlaceAutocompleteElement({ includedRegionCodes: ['us'] });
        el.style.width = '100%';
        el.placeholder = placeholder;   // honoured by the element if it supports it
        el.value = value ?? '';

        // Selecting a suggestion. The event carries a PlacePrediction, not a
        // Place — the address needs one fetchFields round-trip (camelCase now:
        // formattedAddress, not the old formatted_address).
        el.addEventListener('gmp-select', async (e) => {
          const place = e.placePrediction?.toPlace?.() ?? e.place;
          if (!place) return;
          await place.fetchFields?.({ fields: ['formattedAddress'] });
          const addr = place.formattedAddress;
          if (addr) onChangeRef.current({ target: { value: addr } });
        });

        // Typing without picking anything. Required is checked against the
        // parent's state, so an address typed in full and never selected has to
        // reach it or Next would say the field is empty.
        el.addEventListener('input', () => {
          onChangeRef.current({ target: { value: el.value ?? '' } });
        });

        hostRef.current.appendChild(el);
        elRef.current = el;
        setReady(true);
      })
      .catch(() => {}); // no key / offline: the TextField fallback below still works
    return () => { cancelled = true; elRef.current?.remove(); elRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Parent-driven writes: editing a saved trip, and the return-trip swap, both
  // set the address from outside. Safe to assign — a programmatic set fires no
  // input event on this element, so this cannot loop back through onChange.
  useEffect(() => {
    const el = elRef.current;
    if (el && (value ?? '') !== el.value) el.value = value ?? '';
  }, [value]);

  return (
    <Box sx={{ width: '100%' }}>
      <Box ref={hostRef} sx={{ display: ready ? 'block' : 'none' }} />
      {!ready && (
        <TextField
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          {...props}
        />
      )}
      {ready && error && helperText && (
        <FormHelperText error sx={{ mx: 1.75 }}>{helperText}</FormHelperText>
      )}
    </Box>
  );
}
