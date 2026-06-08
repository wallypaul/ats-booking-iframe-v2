import { useState } from 'react';

// Import components
import PaymentCard from '../components/confirnation-components/PaymentCard';
import PendingApprovalCard from '../components/confirnation-components/PendingApprovalCard';
import InputBookingId from '../components/confirnation-components/InputBookingId';
import { Shell } from './App';
// import ConfirmationCard from '../components/confirnation-components/ConfirmationCard';

export default function ConfirmationPage() {
  const [bookingStatus, setBookingStatus] = useState('pending'); // 'pending', 'payment', 'confirmed'
  const [bookingId, seBookingId] = useState(false);
  return (
    <Shell showBrand={true}>
        <h1>Enter booking id</h1>
        <InputBookingId />
        {bookingId && <h2>Your booking id is: {bookingId}</h2>}

      {bookingStatus === 'pending' && <PendingApprovalCard />}
      {bookingStatus === 'payment' && <PaymentCard />}
      {bookingStatus === 'confirmed' && <InputBookingId />}
    </Shell>
  );
}