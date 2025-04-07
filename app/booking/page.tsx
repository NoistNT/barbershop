import BookingSteps from '@/components/booking/booking-steps';

export default function BookingPage() {
  return (
    <main className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Book Your Appointment</h1>
      <BookingSteps />
    </main>
  );
}
