import { Box, Grid, TextField, Typography } from '@mui/material';

function Field({ label, required, children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, width: '100%', minWidth: 0 }}>
      <Typography
        component="label"
        variant="body2"
        sx={{ fontWeight: 600, fontSize: '0.82rem', color: 'text.primary', display: 'flex', alignItems: 'center' }}
      >
        {label}
        {required && (
          <Typography component="span" sx={{ color: 'error.main', ml: 0.25 }}>*</Typography>
        )}
      </Typography>
      {children}
    </Box>
  );
}

export default function PassengerDetails({ data, errors, onChange, onBlur }) {
  const update = (field) => (e) => onChange({ ...data, [field]: e.target.value });

  // Phone fields: allow only digits and formatting chars (+ ( ) - . space), strip letters
  const updatePhone = (field) => (e) =>
    onChange({ ...data, [field]: e.target.value.replace(/[^\d+().\-\s]/g, '') });

  const maxDob = (() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  return (
    <Grid container spacing={2} rowSpacing={3}>
      {/* Row 1: First + Last */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Field label="First Name" required>
          <TextField fullWidth placeholder="John"
            value={data.firstName} onChange={update('firstName')}
            error={!!errors.firstName} helperText={errors.firstName} />
        </Field>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <Field label="Last Name" required>
          <TextField fullWidth placeholder="Doe"
            value={data.lastName} onChange={update('lastName')}
            error={!!errors.lastName} helperText={errors.lastName} />
        </Field>
      </Grid>

      {/* Row 2: Email — full width */}
      <Grid size={{ xs: 12 }}>
        <Field label="Email Address" required>
          <TextField fullWidth type="email" placeholder="john@example.com"
            value={data.email} onChange={update('email')}
            error={!!errors.email} helperText={errors.email} />
        </Field>
      </Grid>

      {/* Row 3: Phone + Alternative Phone */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Field label="Phone Number" required>
          <TextField fullWidth type="tel" inputMode="tel" placeholder="+1 (555) 000-0000"
            value={data.phone_1} onChange={updatePhone('phone_1')}
            onBlur={() => onBlur?.('phone_1')}
            error={!!errors.phone_1} helperText={errors.phone_1} />
        </Field>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <Field label="Alternative Phone" required>
          <TextField fullWidth type="tel" inputMode="tel" placeholder="+1 (555) 000-0000"
            value={data.phone_2} onChange={updatePhone('phone_2')}
            onBlur={() => onBlur?.('phone_2')}
            error={!!errors.phone_2} helperText={errors.phone_2} />
        </Field>
      </Grid>

      {/* Row 4: Date of Birth — full width */}
      <Grid size={{ xs: 12 }}>
        <Field label="Date of Birth" required>
          <TextField fullWidth type="date"
            value={data.dob} onChange={update('dob')}
            error={!!errors.dob} helperText={errors.dob}
            slotProps={{
              htmlInput: { max: maxDob },
              inputLabel: { shrink: true },
            }} />
        </Field>
      </Grid>
    </Grid>
  );
}