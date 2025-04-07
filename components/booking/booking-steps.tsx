'use client';

import { redirect } from 'next/navigation';
import { useState } from 'react';

import BarberSelection from '@/components/booking/barber-selection';
import Confirmation from '@/components/booking/confirmation';
import DateTimeSelection from '@/components/booking/date-time-selection';
import ServiceSelection from '@/components/booking/service-selection';
import type { BookingData } from '@/types/booking';

export default function BookingSteps() {
  const steps = [1, 2, 3, 4];
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    serviceId: null,
    barberId: null,
    dateTime: null,
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  const handleConfirm = async () => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // userId: currentUser.id,
          userId: '0ed5d361-82f0-4a7b-b34f-33acd6f46fc1', // hardcoded for now
          serviceId: bookingData.serviceId,
          barberId: bookingData.barberId,
          startTime: bookingData.dateTime!,
        }),
      });

      if (!response.ok) throw new Error('Failed to create appointment');

      const result = await response.json();
      console.log('Appointment created:', result);
      redirect('/success');
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  return (
    <div className="max-w-sm w-full mx-auto p-6 bg-card ring-2 ring-muted rounded-lg shadow-lg">
      <div className="flex justify-between mb-8 max-w-3/4 mx-auto">
        {steps.map((stepNumber) => (
          <div
            key={stepNumber}
            className={`w-8 h-8 rounded-full flex items-center justify-center 
              ${step >= stepNumber ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            {stepNumber}
          </div>
        ))}
      </div>

      {step === 1 && (
        <ServiceSelection
          onNext={(serviceId) => {
            updateBookingData({ serviceId });
            nextStep();
          }}
        />
      )}

      {step === 2 && (
        <BarberSelection
          serviceId={bookingData.serviceId!}
          onBack={prevStep}
          onNext={(barberId) => {
            updateBookingData({ barberId });
            nextStep();
          }}
        />
      )}

      {step === 3 && (
        <DateTimeSelection
          barberId={bookingData.barberId!}
          serviceId={bookingData.serviceId!}
          onBack={prevStep}
          onNext={(dateTime) => {
            updateBookingData({ dateTime });
            nextStep();
          }}
        />
      )}

      {step === 4 && (
        <Confirmation
          bookingData={bookingData}
          onBack={prevStep}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
