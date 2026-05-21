import { Box, Grid, TextField, Typography } from '@mui/material';

function Field({ label, required, children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: 0 }}>
      <Typography
        component="label"
        variant="body2"
        sx={{ fontWeight: 600, fontSize: '0.82rem', color: 'text.primary', alignItems: 'center', display: 'flex' }}
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

export default function PassengerDetails({ data, errors, onChange }) {
  const update = (field) => (e) => onChange({ ...data, [field]: e.target.value });

  return (
    // add to the grid: style={{ marginLeft: "1em" }}
    <Grid container spacing={2} rowSpacing={3} >
      <Grid size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
        <Field label="First Name" required >
          <TextField
            style={{ marginLeft: "1em" }}
            placeholder="John"
            value={data.firstName}
            onChange={update('firstName')}
            error={!!errors.firstName}
            helperText={errors.firstName}
          />
        </Field>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}  >
        <Field label="Last Name" required>
          <TextField
            style={{ marginLeft: "1em",  }}
            placeholder="Doe"
            value={data.lastName}
            onChange={update('lastName')}
            error={!!errors.lastName}
            helperText={errors.lastName}
          />
        </Field>
      </Grid>

      <Grid size={{ xs: 12, sm: 12 }}  >
        <Field label="Email Address" required>
          <TextField
            style={{ marginLeft: "1em"}}
            type="email"
            placeholder="john@example.com"
            value={data.email}
            onChange={update('email')}
            error={!!errors.email}
            helperText={errors.email}
          />
        </Field>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}  >
        <Field label="Phone Number" required>
          <TextField
            style={{ marginLeft: "1em" }}
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={data.phone_1}
            onChange={update('phone_1')}
            error={!!errors.phone_1}
            helperText={errors.phone_1}
          />
        </Field>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}  >
        <Field label="Alternative Phone " required>
          <TextField
            style={{ marginLeft: "1em", }}
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={data.phone_2}
            onChange={update('phone_2')}
            error={!!errors.phone_2}
            helperText={errors.phone_2}
          />
        </Field>
      </Grid>


      <Grid size={{ xs: 12 }}>
        <Field label="Date of Birth" required>
          <TextField
            fullWidth
            style={{ marginLeft: "1em" }}
            type="date"
            value={data.dob}
            onChange={update('dob')}
            error={!!errors.dob}
            helperText={errors.dob}
            inputProps={{

              max: (() => {
              const today = new Date();
              const yyyy = today.getFullYear();
              const mm = String(today.getMonth() + 1).padStart(2, '0');
              const dd = String(today.getDate()).padStart(2, '0');
              return `${yyyy}-${mm}-${dd}`;
    })()
  }}
          />
        </Field>
      </Grid>

      {/* <Grid size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
        <Field label="Member / Policy ID">
          <TextField
            placeholder="e.g. MED-00412"
            value={data.memberId}
            onChange={update('memberId')}
            helperText="Optional"
          />
        </Field>
      </Grid> */}
    </Grid>
  );
}
