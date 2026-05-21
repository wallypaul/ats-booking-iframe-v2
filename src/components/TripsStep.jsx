import { useState } from 'react';
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
import AddIcon from '@mui/icons-material/Add';
import ReplayIcon from '@mui/icons-material/Replay';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import FlagIcon from '@mui/icons-material/Flag';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SaveIcon from '@mui/icons-material/Save';

const EMPTY_TRIP = { pickup: '', dropoff: '', date: '', time: '' };

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

export default function TripsStep({ tripsData, setTripsData }) {
  const [draft, setDraft] = useState({ ...EMPTY_TRIP });
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(0);
  const [mode, setMode] = useState(tripsData.length === 0 ? 'add' : 'list');
  const [editIndex, setEditIndex] = useState(null);
  const [showReturnTripBtn, setShowReturnTripBtn] = useState(true);
  const [showAddAnotherTripBtn, setShowAddAnotherTripBtn] = useState(true);
  const returnDraft = {
      pickup: draft.dropoff,
      dropoff: draft.pickup,
      date: draft.date,
      time: draft.time,
    };

  const updateDraft = (field) => (e) =>
    setDraft((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!draft.pickup.trim()) e.pickup = 'Pickup address is required';
    if (!draft.dropoff.trim()) e.dropoff = 'Dropoff address is required';
    if (!draft.date) e.date = 'Date is required';
    if (!draft.time) e.time = 'Time is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };


  const handleReturnTrip = () => {
    
    if (!validate()) return;

    // const returnDraft = {
    //   pickup: draft.dropoff,
    //   dropoff: draft.pickup,
    //   date: draft.date,
    //   time: draft.time,
    // };
    setDraft(returnDraft);
    setErrors({});
    setMode('add');
    if (mode === 'add') {
      setMode('edit');
    } else if (mode === 'edit') {
      saveTrip();
    }
  };

  const saveTrip = () => {
    if (!validate()) return;
    if (editIndex !== null) {
      const next = [...tripsData];
      next[editIndex] = { ...draft };
      setTripsData(next);
      setPage(editIndex);
      setEditIndex(null);
    } else {
      const next = [...tripsData, { ...draft }];
      setTripsData(next);
      setPage(next.length - 1);
    }
    setDraft({ ...EMPTY_TRIP });
    setErrors({});
    setMode('list');
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
                <TextField
                  placeholder="123 Main St, City, State"
                  value={draft.pickup}
                  onChange={updateDraft('pickup')}
                  error={!!errors.pickup}
                  helperText={errors.pickup}
                />
              </Field>
            </Grid>

            <Grid container spacing={0} size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
              <Field label="Dropoff Address" required>
                <TextField
                  placeholder="456 Oak Ave, City, State"
                  value={draft.dropoff}
                  onChange={updateDraft('dropoff')}
                  error={!!errors.dropoff}
                  helperText={errors.dropoff}
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
                  inputProps={{
                    min: (() => {
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

            <Grid container spacing={0} size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
              <Field label="Pickup Time" required>
                <TextField
                  type="time"
                  value={draft.time}
                  onChange={updateDraft('time')}
                  error={!!errors.time}
                  helperText={errors.time}
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
        <Stack direction="row" alignItems="center" justifyContent="space-between">
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
                label="Pickup"
                value={trip.pickup}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
              <DetailRow
                icon={<FlagIcon sx={{ fontSize: 18, color: 'secondary.main', mt: 0.3 }} />}
                label="Dropoff"
                value={trip.dropoff}
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
            handleReturnTrip();
            setShowReturnTripBtn(false);
            setDraft({...returnDraft});
            setErrors({});
            setEditIndex(null);
            setMode('add');
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
