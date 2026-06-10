import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import SearchIcon from '@mui/icons-material/Search';

export default function InputBookingId({ onCheck, loading = false }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onCheck?.(trimmed);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', mb: 2.5, lineHeight: 1.6 }}
      >
        Enter your booking ID to check the status of your reservation. You can
        find it in the confirmation email sent after you made your reservation.
      </Typography>

      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <TextField
          fullWidth
          size="medium"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. BK-12345678"
          label="Booking ID"
          helperText="Enter your booking ID to check the status."
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <ConfirmationNumberOutlinedIcon
                    fontSize="small"
                    sx={{ color: 'text.secondary' }}
                  />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: 2.5 },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          startIcon={<SearchIcon />}
          disabled={!value.trim() || loading}
          sx={{ mt: 1, py: 1.75, whiteSpace: 'nowrap' }}
        >
          Check
        </Button>
      </Box>
    </Box>
  );
}
