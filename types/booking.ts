export interface BookingData {
  serviceId: string | null;
  barberId: string | null;
  dateTime: Date | null;
}

export interface ConfirmationProps {
  bookingData: BookingData;
  onBack: () => void;
  onConfirm: () => void;
}
