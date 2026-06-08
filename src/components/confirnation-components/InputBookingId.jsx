import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import Typography from '@mui/material/Typography';

const bull = (
  <Box
    component="span"
    sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}
  >
    •
  </Box>
);

export default function InputBookingId() {
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
            Please enter your booking id to check the status of your reservation. You can find your booking id in the confirmation email sent to you after making a reservation. If you have any questions or need assistance, please contact our customer support team.
        </Typography>
        <Input
        sx
         placeholder="Enter your booking id" 
        />

      </CardContent>
      <CardActions>
        <Button size="small">Check</Button>
      </CardActions>
    </Card>
  );
}