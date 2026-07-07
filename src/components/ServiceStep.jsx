import {
  Alert,
  Box,
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';

function Field({ label, required, children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: 0 }}>
      <Typography
        component="label"
        variant="body2"
        sx={{ fontWeight: 600, fontSize: '0.82rem', color: 'text.primary' }}
      >
        {label}
        {required && (
          <Typography component="span" sx={{ color: 'error.main', ml: 0.25 }}>
            *
          </Typography>
        )}
      </Typography>
      {children}
    </Box>
  );
}

export default function ServiceStep({ data, errors, onChange, services, servicesLoading, servicesError }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* ── transportation type (service levels this iframe's payer offers) ── */}
      <Field label="Transportation Type" required>
        {servicesLoading ? (
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: '10px' }} />
        ) : servicesError ? (
          <Alert severity="error">Couldn't load services. Please refresh and try again.</Alert>
        ) : services.length === 0 ? (
          <Alert severity="warning">No service available for this location.</Alert>
        ) : (
          <FormControl fullWidth error={!!errors.service}>
            <Select
              value={data.service}
              onChange={(e) => update('service', e.target.value)}
              displayEmpty
              sx={{ borderRadius: '10px', bgcolor: 'background.paper' }}
            >
              <MenuItem value="" disabled>Select…</MenuItem>
              {services.map((svc) => (
                <MenuItem key={svc.code} value={svc.code}>{svc.name}</MenuItem>
              ))}
            </Select>
            {errors.service && <FormHelperText>{errors.service}</FormHelperText>}
          </FormControl>
        )}
      </Field>

      {/* ── passengers & companions ── */}
      <Grid container spacing={2.5}>
        {/* <Grid size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
          <Field label="Number of Passengers" required>
            <FormControl fullWidth error={!!errors.passengers}>
              <Select
                value={data.passengers}
                onChange={(e) => update('passengers', e.target.value)}
                displayEmpty
                sx={{ borderRadius: '10px', bgcolor: 'background.paper' }}
              >
                <MenuItem value="" disabled>Select…</MenuItem>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <MenuItem key={n} value={n}>
                    {n} passenger{n > 1 ? 's' : ''}
                  </MenuItem>
                ))}
              </Select>
              {errors.passengers && (
                <FormHelperText>{errors.passengers}</FormHelperText>
              )}
            </FormControl>
          </Field>
        </Grid> */}

        <Grid size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
          <Field label="Companion / Escort">
            <FormControl fullWidth>
              <Select
                value={data.companion}
                onChange={(e) => update('companion', e.target.value)}
                sx={{ borderRadius: '10px', bgcolor: 'background.paper' }}
              >
                <MenuItem value="none">No companion</MenuItem>
                <MenuItem value="1">1 companion</MenuItem>
                <MenuItem value="2">2 companions</MenuItem>
              </Select>
            </FormControl>
          </Field>
        </Grid>
      </Grid>

      {/* ── comments ── */}
      <Field label="Special Instructions / Comments">
        <TextField
          multiline
          minRows={3}
          placeholder="Mobility aids needed, oxygen equipment, specific vehicle requirements, appointment details…"
          value={data.comments}
          onChange={(e) => update('comments', e.target.value)}
        />
      </Field>

    </Box>
  );
}
