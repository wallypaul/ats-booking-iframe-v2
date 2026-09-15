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
import { formatAmount, preferred, toAmount } from '../money';
import { deadheadFor, estimateTotal } from '../deadhead';

/** One row of the cost breakdown: label left, figure right. */
function CostLine({ label, value }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="caption" sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
    </Box>
  );
}

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

export default function Confirmation({ passenger, serviceData, services = [], tripsData, tripPrices, itinerary, termsAccepted, onTermsChange }) {
  // Prefer the server's own figure for each line, falling back PER FIELD to one
  // derived from the per-leg prices.
  //
  // Per field, not all-or-nothing: an earlier version asked "did an itinerary
  // come back?" and then trusted every key on it, so a server that predated
  // `legs_miles` rendered "Trip mileage 0.00 mi" next to a correct total. A
  // missing key must fall back, never read as zero.
  //
  // Only the server's numbers are guaranteed to match what the booking is
  // charged on submit — the fallbacks re-derive the same per-day rule from
  // single-leg answers, which is close but not authoritative.
  const sumLegs = (key) => tripPrices.reduce((sum, p) => sum + toAmount(p?.[key]), 0);

  const derived = deadheadFor(tripsData, tripPrices);
  const deadhead = {
    miles: preferred(itinerary?.deadhead_miles, () => derived?.miles ?? 0),
    price: preferred(itinerary?.deadhead_price, () => derived?.price ?? 0),
  };
  const total = preferred(itinerary?.total, () => estimateTotal(tripsData, tripPrices));
  const legsTotal = preferred(itinerary?.legs_total, () => sumLegs('price'));
  const legsMiles = preferred(itinerary?.legs_miles, () => sumLegs('distance_miles') || sumLegs('distance'));
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
          {/* The total first and largest, then the lines that add up to it.
              A deadhead figure tucked under the trip prices reads as a footnote
              to a number the client has already accepted — it is not, it is part
              of what they pay. */}
          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '2px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2 }}>
              <Typography variant="body2" fontWeight={700}>Total Estimated Price</Typography>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                ${formatAmount(total)}
              </Typography>
            </Box>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <CostLine label="Trip fare" value={`$${formatAmount(legsTotal)}`} />
              <CostLine label="Trip mileage" value={`${formatAmount(legsMiles)} mi`} />
              {deadhead.price > 0 && (
                <>
                  <CostLine label="Deadhead cost" value={`$${formatAmount(deadhead.price)}`} />
                  <CostLine label="Deadhead mileage" value={`${formatAmount(deadhead.miles)} billable mi`} />
                </>
              )}
            </Box>
            {deadhead.price > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Deadhead is the empty drive from our base out to your first pickup and
                home from your last drop-off, each day you travel.
              </Typography>
            )}
          </Box>
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
