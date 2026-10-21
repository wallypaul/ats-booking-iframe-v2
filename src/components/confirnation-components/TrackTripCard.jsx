import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import FactCheckIcon from '@mui/icons-material/FactCheckOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StatusCard from './StatusCard';
import { requestTrackCode, verifyTrackCode, getTrackStatus } from '../../api/track';
import { tripWhen } from '../../nyTime';

// Status only: no map, no driver location, no invoice. The page re-reads the
// statuses on this interval while it is open, so a change shows without a reload.
const POLL_MS = 15000;
const IDLE_MS = 5 * 60 * 1000; // expire the session after 5 min of tab inactivity

// Trip status → rider-facing label + accent colour.
const STATUS_UI = {
  scheduled: { label: 'Scheduled', color: 'secondary', text: 'Your trip is scheduled.' },
  en_route: { label: 'Driver on the way', color: 'primary', text: 'Your driver is on the way to pick you up.' },
  arrived: { label: 'Driver has arrived', color: 'primary', text: 'Your driver has arrived at the pickup location.' },
  picked_up: { label: 'On the way to drop-off', color: 'primary', text: 'You’re on the way to your destination.' },
  in_progress: { label: 'On the way to drop-off', color: 'primary', text: 'You’re on the way to your destination.' },
  completed: { label: 'Trip complete', color: 'secondary', text: 'Your trip is complete. Thank you for riding with us.' },
  cancelled: { label: 'Trip cancelled', color: 'error', text: 'This trip was cancelled.' },
  cancelled_at_door: { label: 'Trip cancelled', color: 'error', text: 'This trip was cancelled at the door.' },
  no_show: { label: 'No show', color: 'error', text: 'This trip was marked as a no-show.' },
};

export default function TrackTripCard({ bookingRef }) {
  // idle -> code -> tracking -> expired
  const [step, setStep] = useState('idle');
  const [hint, setHint] = useState('');
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [trips, setTrips] = useState(null);
  const timer = useRef(null);

  const sendCode = useCallback(() => {
    setBusy(true);
    setError('');
    requestTrackCode(bookingRef)
      .then((d) => { setHint(d.email_hint); setStep('code'); setCode(''); })
      .catch((e) => setError(e.response?.data?.error || 'Could not send a code. Please try again.'))
      .finally(() => setBusy(false));
  }, [bookingRef]);

  const verify = (e) => {
    e?.preventDefault();
    if (code.trim().length !== 6) return;
    setBusy(true);
    setError('');
    verifyTrackCode(bookingRef, code.trim())
      .then((d) => { setToken(d.token); setStep('tracking'); })
      .catch((e) => setError(e.response?.data?.error || 'That code is invalid or expired.'))
      .finally(() => setBusy(false));
  };

  // Poll status while tracking.
  useEffect(() => {
    if (step !== 'tracking' || !token) return undefined;
    let active = true;
    const poll = () => getTrackStatus(bookingRef, token)
      .then((d) => { if (active) setTrips(d.trips ?? []); })
      .catch(() => {});
    poll();
    timer.current = setInterval(poll, POLL_MS);
    return () => { active = false; clearInterval(timer.current); };
  }, [step, token, bookingRef]);

  // Inactivity expiry: 5 min with no activity on the tab ends the session.
  useEffect(() => {
    if (step !== 'tracking') return undefined;
    let t;
    const expire = () => { setStep('expired'); setToken(''); setTrips(null); };
    const bump = () => { clearTimeout(t); t = setTimeout(expire, IDLE_MS); };
    const onVis = () => { if (document.visibilityState === 'visible') bump(); };
    const events = ['mousemove', 'keydown', 'pointerdown', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, bump, { passive: true }));
    document.addEventListener('visibilitychange', onVis);
    bump();
    return () => {
      clearTimeout(t);
      events.forEach((ev) => window.removeEventListener(ev, bump));
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [step]);

  // --- idle: offer to show the trip statuses --------------------------------
  if (step === 'idle') {
    return (
      <StatusCard
        icon={<FactCheckIcon />}
        color="primary"
        statusLabel="Trip status"
        title="Check your trip status"
        description="See where each trip on this booking stands. We’ll email a 6-digit code to the address on this booking to keep your trip details private."
      >
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Button
          variant="contained"
          fullWidth
          onClick={sendCode}
          disabled={busy}
          startIcon={busy ? <CircularProgress size={18} color="inherit" /> : <FactCheckIcon />}
          sx={{ py: 1.5 }}
        >
          Email me a code
        </Button>
      </StatusCard>
    );
  }

  // --- expired: session timed out -----------------------------------------
  if (step === 'expired') {
    return (
      <StatusCard
        icon={<AccessTimeIcon />}
        color="secondary"
        statusLabel="Session ended"
        title="Trip status paused"
        description="For your privacy, trip status paused after 5 minutes of inactivity. Verify again to pick up where you left off."
      >
        <Button
          variant="contained"
          fullWidth
          onClick={sendCode}
          disabled={busy}
          startIcon={busy ? <CircularProgress size={18} color="inherit" /> : <FactCheckIcon />}
          sx={{ py: 1.5 }}
        >
          Show my trips again
        </Button>
      </StatusCard>
    );
  }

  // --- code: enter the 6-digit code ---------------------------------------
  if (step === 'code') {
    return (
      <StatusCard
        icon={<FactCheckIcon />}
        color="primary"
        statusLabel="Verify"
        title="Enter your code"
        description={`We sent a 6-digit code to ${hint}. It expires in 10 minutes.`}
      >
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={verify}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'flex-start' }}
          >
            <TextField
              fullWidth
              label="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              autoFocus
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={code.trim().length !== 6 || busy}
              sx={{ mt: { sm: 1 }, py: 1.75, whiteSpace: 'nowrap' }}
            >
              Verify
            </Button>
          </Stack>
          <Button size="small" onClick={sendCode} disabled={busy} sx={{ mt: 1.5, color: 'text.secondary' }}>
            Resend code
          </Button>
        </Box>
      </StatusCard>
    );
  }

  // --- tracking: the status of every trip on the booking --------------------
  const count = trips?.length ?? 0;

  return (
    <StatusCard
      icon={<FactCheckIcon />}
      color="primary"
      statusLabel="Trip status"
      title={count > 1 ? 'Your trips' : 'Your trip'}
      description="Statuses update on their own while this page is open."
    >
      {!trips && (
        <Stack alignItems="center" sx={{ py: 2 }}>
          <CircularProgress size={22} />
        </Stack>
      )}

      {trips && count === 0 && (
        <Typography variant="body2" color="text.secondary">
          No trips are on this booking yet.
        </Typography>
      )}

      {trips && count > 0 && (
        <Stack spacing={1.5} component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {trips.map((trip, i) => {
            const ui = STATUS_UI[trip.status] || STATUS_UI.scheduled;
            return (
              <Box
                component="li"
                // Position, not an id: the payload carries none, and the
                // trips never reorder - the server sorts by date and time.
                key={i}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {count > 1 ? `Trip ${i + 1} of ${count} · ` : ''}
                    {tripWhen(trip.date, trip.time)}
                  </Typography>
                  <Chip
                    size="small"
                    color={ui.color}
                    label={ui.label}
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {ui.text}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 1, wordBreak: 'break-word' }}
                >
                  {trip.pick_up_address} → {trip.drop_off_address}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      )}
    </StatusCard>
  );
}
