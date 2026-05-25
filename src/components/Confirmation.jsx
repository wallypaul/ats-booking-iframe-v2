import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import AccessibleIcon from '@mui/icons-material/Accessible';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FlagIcon from '@mui/icons-material/Flag';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const SERVICES_MAP = {
  2: {
    label: 'Ambulatory',
    tag: 'Walk-on',
    icon: <DirectionsWalkIcon sx={{ fontSize: 28, color: 'primary.main' }} />,
  },
  3: {
    label: 'Wheelchair',
    tag: 'ADA Accessible',
    icon: <AccessibleIcon sx={{ fontSize: 28, color: 'primary.main' }} />,
  },
};

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

export default function Confirmation({ passenger, serviceData, tripsData, tripPrices }) {
  const svc = SERVICES_MAP[serviceData.service];

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
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
            {svc?.icon}
            <Box>
              <Typography fontWeight={700}>{svc?.label}</Typography>
              <Chip
                label={svc?.tag}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: 10,
                  bgcolor: 'primary.main',
                  color: '#fff',
                  height: 20,
                  mt: 0.3,
                }}
              />
            </Box>
          </Stack>
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
              <Grid container spacing={1} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <LocationOnIcon
                      sx={{ fontSize: 16, color: 'primary.main' }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {trip.pickup}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <FlagIcon
                      sx={{ fontSize: 16, color: 'secondary.main' }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {trip.dropoff}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <CalendarTodayIcon
                      sx={{ fontSize: 16, color: 'text.secondary' }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {trip.date}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
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
                    {tripPrices[i].distance} mi · {tripPrices[i].duration}
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="primary.main">
                    ${tripPrices[i].price}
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
                ${tripPrices.reduce((sum, p) => sum + (p.price || 0), 0)}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
