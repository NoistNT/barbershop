'use client';

import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import type { ConfirmationProps } from '@/types/booking';

export default function Confirmation({ bookingData, onBack, onConfirm }: ConfirmationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatLocalTime = (utcDate: Date) => {
    // Clone the date to avoid mutation
    const local = new Date(utcDate);
    // Add the timezone offset to convert UTC to local
    local.setMinutes(local.getMinutes() + local.getTimezoneOffset());
    return format(local, "MMMM d, yyyy 'at' h:mm a");
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Confirm Your Appointment</h2>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-1">Service</h3>
          <p>Service ID: {bookingData.serviceId}</p>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-1">Barber</h3>
          <p>Barber ID: {bookingData.barberId}</p>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-1">Date & Time</h3>
          <p>{bookingData.dateTime ? formatLocalTime(bookingData.dateTime) : 'No time selected'}</p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirming...
            </>
          ) : (
            'Confirm Appointment'
          )}
        </Button>
      </div>
    </div>
  );
}
