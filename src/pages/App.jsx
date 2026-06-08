import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Fade,
  Stack,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import PassengerDetails from '../components/PassengerDetails';
import ServiceStep from '../components/ServiceStep';
import TripsStep from '../components/TripsStep';
import Confirmation from '../components/Confirmation';

const STEPS = ['Passenger', 'Service', 'Trips', 'Confirm'];

const INITIAL_PASSENGER = {
  firstName: '',
  lastName: '',
  email: '',
  phone_1: '',
  phone_2: '',
  dob: '',
};

const INITIAL_SERVICE = {
  service: '',
  // passengers: '',
  companion: 'none',
  comments: '',
};
const INITIAL_TRIP = {
  pick_up_address: '',
  drop_off_address: '',
  date: '',
  time: '',
};

const normalizeDurationToHours = (duration) => {
  if (duration == null || duration === '') return duration;
  if (typeof duration === 'number') return Math.ceil(duration);

  const value = String(duration).toLowerCase();
  const hoursMatch = value.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/);
  const minutesMatch = value.match(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)\b/);

  if (hoursMatch || minutesMatch) {
    const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;
    return Math.ceil(hours + minutes / 60);
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? duration : Math.ceil(parsed);
};

const addTripPricesToTrips = (trips, prices) =>
  trips.map((trip, i) => ({
    ...trip,
    price: prices[i]?.price,
    distance: prices[i]?.distance,
    duration: normalizeDurationToHours(prices[i]?.duration),
  }));

export default function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [submitError, setSubmitError] = useState('');

  // ── form data ──
  const [passenger, setPassenger] = useState({ ...INITIAL_PASSENGER });
  const [passengerErrors, setPassengerErrors] = useState({});

  const [serviceData, setServiceData] = useState({ ...INITIAL_SERVICE });
  const [serviceErrors, setServiceErrors] = useState({});

  const [tripsData, setTripsData] = useState([]);
  const [tripPrices, setTripPrices] = useState([]);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // ── validation ──
  const usPhoneRegex = /^(\+1)?\s?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

  const handlePassengerBlur = (field) => {
    const value = passenger[field].trim();
    setPassengerErrors((prev) => {
      const e = { ...prev };
      if (field === 'phone_1') {
        if (!value) e.phone_1 = 'Phone number is required';
        else if (!usPhoneRegex.test(value)) e.phone_1 = 'Enter a valid US phone number';
        else delete e.phone_1;
      }
      if (field === 'phone_2') {
        if (value && !usPhoneRegex.test(value)) e.phone_2 = 'Enter a valid US phone number';
        else delete e.phone_2;
      }
      return e;
    });
  };

  const validatePassenger = () => {
    const e = {};
    if (!passenger.firstName.trim()) e.firstName = 'First name is required';
    if (!passenger.lastName.trim()) e.lastName = 'Last name is required';
    if (!passenger.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(passenger.email)) e.email = 'Enter a valid email';
    if (!passenger.phone_1.trim()) e.phone_1 = 'Phone number is required';
    else if (!usPhoneRegex.test(passenger.phone_1.trim())) e.phone_1 = 'Enter a valid US phone number';
    if (passenger.phone_2.trim() && !usPhoneRegex.test(passenger.phone_2.trim())) e.phone_2 = 'Enter a valid US phone number';
    if (!passenger.dob) e.dob = 'Date of birth is required';
    setPassengerErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateService = () => {
    const e = {};
    if (!serviceData.service) e.service = 'Select a transportation type';
    // if (!serviceData.passengers) e.passengers = 'Select number of passengers';
    setServiceErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        return validatePassenger();
      case 1:
        return validateService();
      case 2:
        return tripsData.length > 0;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    if (activeStep === 2) {
      setIsPricingLoading(true);
      setSubmitError('');
      try {
        const payload = tripsData.map((t) => ({ origin: t.pick_up_address, destination: t.drop_off_address , service: serviceData.service , companion: serviceData.companion }));
        const res = await fetch(`${import.meta.env.VITE_API_URL}/distance/bulk/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Pricing unavailable');
        const prices = await res.json();
        const pricedTripsData = addTripPricesToTrips(tripsData, prices);
        setTripPrices(prices);
        setTripsData(pricedTripsData);
        setActiveStep((s) => Math.min(s + 1, 3));
      } catch {
        setSubmitError('Could not calculate trip pricing. Please try again.');
      } finally {
        setIsPricingLoading(false);
      }
      return;
    }
    setActiveStep((s) => Math.min(s + 1, 3));
  };
  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));
  const handleStepClick = (idx) => {
    if (idx < activeStep) setActiveStep(idx);
  };

  const flattenErrors = (obj) =>
    Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
    );

  const handleSubmit = async () => {
    setSubmitError('');
    const pricedTripsData = addTripPricesToTrips(tripsData, tripPrices);
    const payload = { passenger, serviceData, tripsData: pricedTripsData };
    try {
      console.log('Submitting payload:', payload); // Debug log
      const res = await fetch(`${import.meta.env.VITE_API_URL}/booking/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await res.json();

      if (res.status === 201) {
        setBookingResult(body);
        setSubmitted(true);
        return;
      }

      if (res.status === 400) {
        if (body.passenger) {
          setPassengerErrors(flattenErrors(body.passenger));
          setActiveStep(0);
          return;
        }
        if (body.serviceData) {
          setServiceErrors(flattenErrors(body.serviceData));
          setActiveStep(1);
          return;
        }
        const msg =
          body.non_field_errors?.[0] ||
          (Array.isArray(body.tripsData) ? body.tripsData[0] : null) ||
          'Submission failed. Please review your entries.';
        setSubmitError(msg);
        return;
      }

      setSubmitError('An unexpected error occurred. Please try again.');
    } catch {
      setSubmitError('Unable to reach the server. Please check your connection.');
    }
  };
  const handleCloseError = () => setSubmitError('');

  const handleReset = () => {
    setActiveStep(0);
    setSubmitted(false);
    setBookingResult(null);
    setSubmitError('');
    setPassenger({ ...INITIAL_PASSENGER });
    setPassengerErrors({});
    setServiceData({ ...INITIAL_SERVICE });
    setServiceErrors({});
    setTripsData([]);
    setTripPrices([]);
    setTermsAccepted(false);
  };

  // ── render current step ──
  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <PassengerDetails
            data={passenger}
            errors={passengerErrors}
            onChange={(d) => {
              const changedField = Object.keys(d).find((k) => d[k] !== passenger[k]);
              setPassenger(d);
              if (changedField) {
                setPassengerErrors((prev) => { const e = { ...prev }; delete e[changedField]; return e; });
              }
            }}
            onBlur={handlePassengerBlur}
          />
        );
      case 1:
        return (
          <ServiceStep
            data={serviceData}
            errors={serviceErrors}
            onChange={(d) => {
              setServiceData(d);
              setServiceErrors({});
            }}
          />
        );
      case 2:
        return <TripsStep tripsData={tripsData} setTripsData={setTripsData} />;
      case 3:
        return (
          <Confirmation
            passenger={passenger}
            serviceData={serviceData}
            tripsData={tripsData}
            tripPrices={tripPrices}
            termsAccepted={termsAccepted}
            onTermsChange={setTermsAccepted}
          />
        );
      default:
        return null;
    }
  };

  const stepSubtitles = [
    "Provide the passenger's personal information.",
    'Select the transportation type and trip details.',
    tripsData.length === 0
      ? 'Add at least one trip to continue.'
      : `${tripsData.length} trip${tripsData.length > 1 ? 's' : ''} added — add more or continue.`,
    'Please review all details before submitting.',
  ];

  // ── success screen ──
  if (submitted) {
    return (
      <Shell>
        <Fade in timeout={500}>
          <Box sx={{ textAlign: 'center', py: 7 }}>
            <CheckCircleOutlineIcon
              sx={{ fontSize: 72, color: 'secondary.main', mb: 2 }}
            />
            <Typography variant="h5" sx={{ mb: 1 }}>
              {bookingResult?.message || 'Booking Submitted'}
            </Typography>
            {bookingResult?.id && (
              <Typography color="text.secondary" sx={{ mb: 0.5, fontSize: 13 }}>
                Reference #: <strong>{bookingResult.id}</strong>
              </Typography>
            )}
            <Typography color="text.secondary" sx={{ mb: 0.5 }}>
              Your {tripsData.length} trip{tripsData.length > 1 ? 's' : ''} for{' '}
              <strong>
                {passenger.firstName} {passenger.lastName}
              </strong>{' '}
              {tripsData.length > 1 ? 'have' : 'has'} been submitted.
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4, fontSize: 14 }}>
              Confirmation will be sent to{' '}
              <strong>{passenger.email}</strong>
            </Typography>
            <Button
              variant="contained"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
            >
              New Booking
            </Button>
          </Box>
        </Fade>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* ── stepper ── */}
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{ mb: 4 }}
      >
        {STEPS.map((label, idx) => (
          <Step
            key={label}
            completed={idx < activeStep}
            sx={{ cursor: idx < activeStep ? 'pointer' : 'default' }}
            onClick={() => handleStepClick(idx)}
          >
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* ── header ── */}
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        {['Passenger Details', 'Service & Needs', 'Trip Details', 'Review & Confirm'][activeStep]}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        {stepSubtitles[activeStep]}
      </Typography>

      {/* ── body ── */}
      <Fade in key={activeStep} timeout={350}>
        <Box sx={{ minHeight: 300, pl: '1em' }}>{renderStep()}</Box>
      </Fade>

      {/* ── footer nav ── */}
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          mt: 4,
          pt: 2.5,
          borderTop: '1.5px solid',
          borderColor: 'divider',
        }}
      >
        {activeStep > 0 && (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': { borderColor: 'text.secondary', bgcolor: 'transparent' },
            }}
          >
            Back
          </Button>
        )}

        {activeStep < 3 ? (
          <Button
            variant="contained"
            endIcon={isPricingLoading ? <CircularProgress size={16} color="inherit" /> : <ArrowForwardIcon />}
            onClick={handleNext}
            disabled={(activeStep === 2 && tripsData.length === 0) || isPricingLoading}
            sx={{ ml: 'auto' }}
          >
            {isPricingLoading ? 'Calculating…' : 'Continue'}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            endIcon={<CheckCircleOutlineIcon />}
            onClick={handleSubmit}
            disabled={!termsAccepted}
            sx={{ ml: 'auto' }}
          >
            Submit Booking
          </Button>
        )}
      </Stack>
      <Snackbar
        open={!!submitError}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={6000}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {submitError}
        </Alert>
      </Snackbar>
    </Shell>
  );
}

/* ═══ layout shell ═══ */
export function Shell({ children, showBrand = true }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        py: 5,
        px: 2,
      }}
    >
      <Container maxWidth="sm" disableGutters>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            boxShadow: '0 4px 28px rgba(28,26,22,0.06)',
          }}
        >
          {showBrand && (
            <>
              {/* brand */}
              <Stack
                direction="row"
                spacing={1}
              
                sx={{ mb: 0.5, alignItems:'center' }}
              >
                <LocalHospitalIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                <Typography
                  variant="h4"
                  sx={{ fontSize: '1.1rem', color: 'primary.main', lineHeight: 1 }}
                  align="center"

                >
                  ATS BOOKING
                </Typography>
              </Stack>
              <Typography
                variant="h5"
                color="text.secondary"
                align="center"
                sx={{ mb: 3, fontSize: '1.1em', letterSpacing: '0.04em' }}
              >
                Accessible Transportation Services
              </Typography>
            </>
          )}

          {children}
        </Paper>
      </Container>
    </Box>
  );
}
