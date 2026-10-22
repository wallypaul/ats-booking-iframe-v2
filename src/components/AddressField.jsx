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
// That shadow root does not close off colour. Google publishes its Material
// palette as --gmp-mat-color-* custom properties, and custom properties inherit
// THROUGH the boundary. Left unset they fall back to Google's own defaults — a
// pure #FFFFFF field with a blue focus ring — sitting beside MUI fields painted
// #FFFEF9, which is what made this one input look like it changed colour.
//
// ponytail: colour, radius and font reach it; height and inner padding do not,
// so the field can still sit a few px shorter than its neighbours. Closing that
// last gap would mean dropping to the AutocompleteSuggestion API and rendering
// the list in MUI ourselves — a lot of code for a few pixels.

// Google's Material tokens, mapped onto this form's theme. Names are the ones
// Google actually publishes — an unknown custom property is ignored in silence,
// so a plausible-looking guess here would leave the field styled by Google and
// look like the fix simply had no effect.
const GMP_THEME = (theme) => ({
  // The field and the suggestion list, matching MuiSelect/MuiOutlinedInput.
  '--gmp-mat-color-surface': theme.palette.background.paper,
  '--gmp-mat-color-on-surface': theme.palette.text.primary,
  // Placeholder, and the secondary line under each suggestion.
  '--gmp-mat-color-on-surface-variant': theme.palette.text.secondary,
  // The resting border. NOT --gmp-mat-color-outline, which is not a real token.
  // MUI's own outlined-input border, not theme.divider (#E2DED6): every
  // neighbouring TextField draws this, and divider read as a washed-out field.
  '--gmp-mat-color-outline-decorative': 'rgba(0, 0, 0, 0.23)',
  // Focus ring and active accent — Google's blue otherwise.
  '--gmp-mat-color-primary': theme.palette.primary.main,
  // The wash behind a hovered or keyboard-highlighted suggestion.
  '--gmp-mat-color-secondary-container': theme.palette.background.default,
  '--gmp-mat-color-on-secondary-container': theme.palette.text.primary,
  '--gmp-mat-font-family': theme.typography.fontFamily,
});

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
      <Box
        ref={hostRef}
        sx={(theme) => ({
          display: ready ? 'block' : 'none',
          // Custom properties inherit through the shadow boundary, so setting
          // them on this wrapper reaches the element's internals.
          ...GMP_THEME(theme),
          // Geometry does not inherit, but the element's own box is styleable
          // from outside — only its shadow internals are closed. This is what
          // squares the 10px corners of every neighbouring field.
          '& gmp-place-autocomplete': {
            width: '100%',
            // 10px: the radius theme.js gives MuiSelect and the inputs.
            borderRadius: '10px',
          },
          // An invalid field reads as invalid here too: the element draws its
          // border from the outline token, so pointing that at error.main is
          // the whole treatment.
          ...(error && {
            '--gmp-mat-color-outline-decorative': theme.palette.error.main,
          }),
        })}
      />
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
