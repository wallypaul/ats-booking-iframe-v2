import {
  Box,
  Chip,
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import AccessibleIcon from '@mui/icons-material/Accessible';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';

const SERVICES = [
  {
    id: 'ambulatory',
    label: 'Ambulatory',
    icon: <DirectionsWalkIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
    desc: 'For passengers who can walk and transfer independently',
    tag: 'Walk-on',
    value: 2,
  },
  {
    id: 'wheelchair',
    label: 'Wheelchair',
    icon: <AccessibleIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
    desc: 'For passengers who require a wheelchair-accessible vehicle',
    tag: 'ADA Accessible',
    value: 3,
  },
];

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

export default function ServiceStep({ data, errors, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* ── transportation type ── */}
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
          Transportation Type *
        </Typography>
        {errors.service && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
            {errors.service}
          </Typography>
        )}
        <Grid container spacing={2} >
          {SERVICES.map((svc) => {
            const active = data.service === svc.value;
            return (
              <Grid key={svc.id} size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
                <Paper
                  elevation={0}
                  onClick={() => update('service', svc.value)}
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    textAlign: 'center',
                    border: '2px solid',
                    borderColor: active ? 'primary.main' : 'divider',
                    bgcolor: active ? 'rgba(184,91,47,0.06)' : 'background.paper',
                    boxShadow: active ? '0 0 0 3px rgba(184,91,47,0.14)' : 'none',
                    borderRadius: 2,
                    transition: 'all 0.25s',
                    '&:hover': { borderColor: active ? 'primary.main' : 'text.secondary' },
                  }}
                >
                  {svc.icon}
                  <Typography variant="h6" sx={{ mt: 1, mb: 0.5, fontSize: '1rem' }}>
                    {svc.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: 13, mb: 1.5, lineHeight: 1.4 }}
                  >
                    {svc.desc}
                  </Typography>
                  <Chip
                    label={svc.tag}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: 11,
                      bgcolor: active ? 'primary.main' : 'divider',
                      color: active ? '#fff' : 'text.secondary',
                      letterSpacing: '0.04em',
                    }}
                  />
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>

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
