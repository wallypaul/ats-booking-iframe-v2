import { useImperativeHandle, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Fade,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddressField from './AddressField';
import { HHMM, isPastInNY, minTimeFor, nyNow } from '../nyTime';
import AddIcon from '@mui/icons-material/Add';
import ReplayIcon from '@mui/icons-material/Replay';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import FlagIcon from '@mui/icons-material/Flag';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SaveIcon from '@mui/icons-material/Save';

const EMPTY_TRIP = { pick_up_address: '', drop_off_address: '', date: '', time: '' };

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

export default function TripsStep({ tripsData, setTripsData, ref }) {
  const [draft, setDraft] = useState({ ...EMPTY_TRIP });
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(0);
  const [mode, setMode] = useState(tripsData.length === 0 ? 'add' : 'list');
  const [editIndex, setEditIndex] = useState(null);
  const [showReturnTripBtn, setShowReturnTripBtn] = useState(true);
  const [showAddAnotherTripBtn, setShowAddAnotherTripBtn] = useState(true);

  const updateDraft = (field) => (e) =>
    setDraft((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!draft.pick_up_address.trim()) e.pick_up_address = 'pick_up_address address is required';
    if (!draft.drop_off_address.trim()) e.drop_off_address = 'drop_off_address address is required';
    if (!draft.date) e.date = 'Date is required';
    if (!draft.time) e.time = 'Time is required';
    else if (!HHMM.test(draft.time.slice(0, 5))) e.time = 'Enter the time as HH:MM';
    // `min` on the inputs is only a hint — typed values and some browsers ignore it.
    // This is the check that actually blocks a past pickup.
    else if (draft.date && isPastInNY(draft.date, draft.time)) {
      e.time = 'That time has already passed in New York (ET)';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };


  // Returns the resulting trips array, or null when the form is incomplete.
  // The caller needs the array: setTripsData is async, so a parent that saved
  // through us would otherwise price the list as it was before the save.
  const saveTrip = () => {
    if (!validate()) return null;
    const next = [...tripsData];
    if (editIndex !== null) next[editIndex] = { ...draft };
    else next.push({ ...draft });
    setTripsData(next);
    setPage(editIndex ?? next.length - 1);
    setEditIndex(null);
    setDraft({ ...EMPTY_TRIP });
    setErrors({});
    setMode('list');
    return next;
  };

  const startEdit = (i) => {
    setDraft({ ...tripsData[i] });
    setEditIndex(i);
    setErrors({});
    setMode('edit');
  };

  const cancelForm = () => {
    setDraft({ ...EMPTY_TRIP });
    setErrors({});
    setEditIndex(null);
    setMode('list');
  };

  const removeTrip = (i) => {
    const next = tripsData.filter((_, idx) => idx !== i);
    setTripsData(next);
    if (next.length === 0) {
      setMode('add');
      setPage(0);
    } else {
      setPage(Math.min(page, next.length - 1));
    }
  };

  // Continue lives in the parent's footer, the half-filled trip lives here. An
  // open form was dropped silently on Continue — worst with Add Return Trip,
  // where the form arrives pre-filled and looks saved already.
  useImperativeHandle(ref, () => ({
    commit: () => {
      if (mode === 'list') return tripsData;
      // A form opened by accident and never touched is not data to save.
      if (Object.values(draft).every((v) => !v)) {
        cancelForm();
        return tripsData;
      }
      return saveTrip();
    },
  }));

  const isEditing = mode === 'edit';

  /* ── trip form (add / edit) ── */
  if (mode === 'add' || mode === 'edit') {
    return (
      <Fade in timeout={300}>
        <Box>
          {isEditing && (
            <Chip
              icon={<EditIcon sx={{ fontSize: 16 }} />}
              label={`Editing Trip ${editIndex + 1}`}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ mb: 2, fontWeight: 600 }}
            />
          )}

          <Grid container spacing={2.5}>
            <Grid container spacing={0} size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }} >
              <Field label="Pickup Address" required>
                <AddressField
                  placeholder="123 Main St, City, State"
                  value={draft.pick_up_address}
                  onChange={updateDraft('pick_up_address')}
                  error={!!errors.pick_up_address}
                  helperText={errors.pick_up_address}
                />
              </Field>
            </Grid>

            <Grid container spacing={0} size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
              <Field label="Drop-off Address" required>
                <AddressField
                  placeholder="456 Oak Ave, City, State"
                  value={draft.drop_off_address}
                  onChange={updateDraft('drop_off_address')}
                  error={!!errors.drop_off_address}
                  helperText={errors.drop_off_address}
                />
              </Field>
            </Grid>

            <Grid container spacing={0} size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
              <Field label="Date" required>
                <TextField
                  type="date"
                  value={draft.date}
                  onChange={updateDraft('date')}
                  error={!!errors.date}
                  helperText={errors.date}
                  slotProps={{ htmlInput: { min: nyNow().date } }}
                />
              </Field>
            </Grid>

            <Grid container spacing={0} size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
              <Field label="Pickup Time" required>
                <TextField
                  type="time"
                  value={draft.time}
                  onChange={updateDraft('time')}
                  error={!!errors.time}
                  helperText={errors.time || 'New York time (ET)'}
                  slotProps={{ htmlInput: { min: minTimeFor(draft.date) } }}
                />
              </Field>
            </Grid>

            <Grid container spacing={0} size={12}>
              <Stack direction="row" spacing={0}>
                
                <Button
                id="saveTripBtn"
                  variant="contained"
                  startIcon={isEditing ? <SaveIcon /> : <AddIcon />}
                  onClick={saveTrip}
                  fullWidth
                  
                >
                  {isEditing ? 'Update Trip' : 'Save Trip'}
                </Button>
                {tripsData.length > 0 && (
                  <Button
                    variant="outlined"
                    startIcon={<CloseIcon />}
                    onClick={cancelForm}
                    sx={{
                      borderColor: 'divider',
                      color: 'text.primary',
                      '&:hover': { borderColor: 'text.secondary', bgcolor: 'transparent' },
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    );
  }

  /* ── trip list with pagination ── */
  const trip = tripsData[page];

  const DetailRow = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, minWidth: 0 }}>
      {icon}
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: 10, mb: 0.2 }}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500} sx={{ wordBreak: 'break-word' }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Fade in timeout={300}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* pager */}
        <Stack direction="row" sx={{ mb: 1, alignItems:'center' , justifyContent:'space-between' }}>
          <IconButton disabled={page === 0} onClick={() => setPage((p) => p - 1)} size="small">
            <NavigateBeforeIcon />
          </IconButton>
          <Typography variant="body2" fontWeight={600}>
            Trip {page + 1} of {tripsData.length}
          </Typography>
          <IconButton
            disabled={page === tripsData.length - 1}
            onClick={() => setPage((p) => p + 1)}
            size="small"
          >
            <NavigateNextIcon />
          </IconButton>
        </Stack>

        {/* trip card */}
        <Paper
          key={page}
          elevation={0}
          sx={{ p: 2.5, border: '1.5px solid', borderColor: 'divider', borderRadius: 2 }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
              <DetailRow
                icon={<LocationOnIcon sx={{ fontSize: 18, color: 'primary.main', mt: 0.3 }} />}
                label="pick_up_address"
                value={trip.pick_up_address}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
              <DetailRow
                icon={<FlagIcon sx={{ fontSize: 18, color: 'secondary.main', mt: 0.3 }} />}
                label="drop_off_address"
                value={trip.drop_off_address}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
              <DetailRow
                icon={<CalendarTodayIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.3 }} />}
                label="Date"
                value={trip.date}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
              <DetailRow
                icon={<AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.3 }} />}
                label="Time"
                value={trip.time}
              />
            </Grid>
          </Grid>

          <Stack
            direction="row"
            spacing={1}
            sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}
          >
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => startEdit(page)}
              sx={{ color: 'primary.main', fontWeight: 600 }}
            >
              Edit
            </Button>
            <Button
              size="small"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => removeTrip(page)}
              sx={{ color: 'error.main', fontWeight: 600 }}
            >
              Remove
            </Button>
          </Stack>
        </Paper>

        {/* add another */}
        {showAddAnotherTripBtn && (
        <Button
          id="addTripBtn"
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth
          onClick={() => {
            setDraft({ ...EMPTY_TRIP });
            setErrors({});
            setEditIndex(null);
            setMode('add');
            setShowReturnTripBtn(false);
          }}
        >
          Add Another Trip
        </Button>
        )}

        {/* Add return trip */}
        {showReturnTripBtn && (
        <Button
          id='returnTripBtn'
          variant="outlined"
          startIcon={<ReplayIcon />}
          onClick={() => {
            // swap pickup/dropoff of the viewed trip as editable defaults; date/time pre-filled, user can change any field
            setDraft({
              pick_up_address: trip.drop_off_address,
              drop_off_address: trip.pick_up_address,
              date: trip.date,
              time: trip.time,
            });
            setErrors({});
            setEditIndex(null);
            setMode('add');
            setShowReturnTripBtn(false);
          }}
          fullWidth
          >
          Add Return Trip
        </Button>
        )}
        

      </Box>
    </Fade>
  );
}
