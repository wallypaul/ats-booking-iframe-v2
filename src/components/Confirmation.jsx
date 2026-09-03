import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Stack,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FlagIcon from '@mui/icons-material/Flag';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { toAmount, formatAmount } from '../money';

function SectionTitle({ children }) {
  return (
    <Typography
      variant="subtitle2"
      color="primary"
      sx={{ mb: 1.5, fontSize: 12, letterSpacing: '0.1em' }}
    >
      {children}
    </Typography>
  );
}

function Row({ label, value }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        py: 0.8,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{ textAlign: 'right', maxWidth: '60%' }}
      >
        {value || '—'}
      </Typography>
    </Box>
  );
}

export default function Confirmation({ passenger, serviceData, services = [], tripsData, tripPrices, termsAccepted, onTermsChange }) {
  const svc = services.find((s) => s.code === serviceData.service);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5  }}>
      {/* ── passenger ── */}
      <Box>
        <SectionTitle>Passenger Information</SectionTitle>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            border: '1.5px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Row
            label="Name"
            value={`${passenger.firstName} ${passenger.lastName}`}
          />
          <Row label="Email" value={passenger.email} />
          <Row label="Phone" value={passenger.phone_1} />
          <Row label="Alternative Phone" value={passenger.phone_2} />
          <Row label="Date of Birth" value={passenger.dob} />
          {passenger.memberId && (
            <Row label="Member ID" value={passenger.memberId} />
          )}
        </Paper>
      </Box>

      {/* ── service ── */}
      <Box>
        <SectionTitle>Service Details</SectionTitle>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            border: '1.5px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Row label="Service" value={svc?.name} />
          {/* <Row
            label="Passengers"
            value={`${serviceData.passengers} passenger${serviceData.passengers > 1 ? 's' : ''}`}
          /> */}
          <Row
            label="Companions"
            value={
              serviceData.companion === 'none'
                ? 'None'
                : `${serviceData.companion} companion${serviceData.companion > 1 ? 's' : ''}`
            }
          />
          {serviceData.comments && (
            <Row label="Comments" value={serviceData.comments} />
          )}
        </Paper>
      </Box>

      {/* ── trips ── */}
      <Box>
        <SectionTitle>Trips ({tripsData.length})</SectionTitle>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            border: '1.5px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          {tripsData.map((trip, i) => (
            <Box key={i}>
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ mb: 1 }}
              >
                Trip {i + 1}
              </Typography>
              <Grid container spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={0.5} >
                    <LocationOnIcon
                      sx={{ fontSize: 16, color: 'primary.main' }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {trip.pick_up_address}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} sx= {{ alignItems: 'center' }}>
                  <Stack direction="row" spacing={0.5} >
                    <FlagIcon
                      sx={{ fontSize: 16, color: 'secondary.main' }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {trip.drop_off_address}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} sx= {{ alignItems: 'center' }}>
                  <Stack direction="row" spacing={0.5} >
                    <CalendarTodayIcon
                      sx={{ fontSize: 16, color: 'text.secondary' }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {trip.date}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} sx= {{ alignItems: 'center' }}>
                  <Stack direction="row" spacing={0.5} >
                    <AccessTimeIcon
                      sx={{ fontSize: 16, color: 'text.secondary' }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {trip.time}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
              {tripPrices[i] && (
                <Box
                  sx={{
                    mt: 1,
                    pt: 1,
                    borderTop: '1px dashed',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Distance: {tripPrices[i].distance} mi · Time: {tripPrices[i].duration}
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="primary.main">
                    Price: ${formatAmount(tripPrices[i].price)}
                  </Typography>
                </Box>
              )}
              {i < tripsData.length - 1 && <Divider sx={{ my: 1.5 }} />}
            </Box>
          ))}
          {tripPrices.length > 1 && (
            <Box
              sx={{
                mt: 1.5,
                pt: 1.5,
                borderTop: '2px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                Total Estimated Price
              </Typography>
              <Typography variant="body1" fontWeight={700} color="primary.main">
                ${formatAmount(tripPrices.reduce((sum, p) => sum + toAmount(p.price), 0))}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
      {/* ── terms ── */}
      <FormControlLabel
        control={
          <Checkbox
            checked={termsAccepted}
            onChange={(e) => onTermsChange(e.target.checked)}
            color="primary"
          />
        }
        label={
          <Typography variant="body2">
            I have read and agree to the{' '}
            <Box
              target="_blank"
              component="a"
              href="https://www.accessibletransportservicesllc.com/privacy"
              sx={{ color: 'primary.main', textDecoration: 'underline' }}
            >
              terms and conditions
            </Box>
          </Typography>
        }
      />
    </Box>
  );
}
