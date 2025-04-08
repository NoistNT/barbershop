'use client';

import { addDays, eachDayOfInterval, format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

interface AvailableSlot {
  time: string;
  available: boolean;
}

export default function DateTimeSelection({
  barberId,
  serviceId,
  onBack,
  onNext,
}: {
  barberId: string;
  serviceId: string;
  onBack: () => void;
  onNext: (dateTime: Date) => void;
}) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Generate dates for the next 2 weeks
  const dateRange = eachDayOfInterval({ start: today, end: addDays(today, 14) });
  const lastDate = dateRange[dateRange.length - 1];

  // Disable dates before today and the next 14 days also prevents selecting dates when loading
  const isDisabled =
    loadingSlots ||
    ((date: Date) => {
      today.setHours(0, 0, 0, 0);
      return date < today || date > lastDate;
    });

  // Fetch available slots when component mounts and when date changes
  useEffect(() => {
    if (!selectedDate) return;

    const fetchAvailableSlots = async () => {
      setLoadingSlots(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const response = await fetch(
          `/api/availability?barberId=${barberId}&date=${dateStr}&serviceId=${serviceId}`
        );

        if (!response.ok) throw new Error('Failed to fetch availability');

        const data = await response.json();
        setAvailableSlots(data.availableSlots || []);
      } catch (error) {
        console.error(error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate, barberId, serviceId]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);

    // Create date in local timezone first
    const localDate = new Date(selectedDate);
    localDate.setHours(hours, minutes, 0, 0);

    // Convert to UTC while maintaining the same wall time
    const utcDate = new Date(
      Date.UTC(
        localDate.getFullYear(),
        localDate.getMonth(),
        localDate.getDate(),
        localDate.getHours(),
        localDate.getMinutes()
      )
    );

    console.log('Submitting:', {
      localInput: `${selectedDate.toDateString()} ${selectedTime}`,
      localISO: localDate.toISOString(),
      utcISO: utcDate.toISOString(),
    });

    onNext(utcDate);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Select Date & Time</h2>

      <div className="grid grid-cols-1 gap-8">
        <div>
          <h3 className="font-medium mb-3">Select a Date</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={isDisabled}
            className="rounded-md border"
            defaultMonth={today}
            fromDate={today}
            toDate={lastDate}
          />
        </div>

        <div>
          <h3 className="font-medium mb-3">
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date first'}
          </h3>

          {loadingSlots ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.time}
                  onClick={() => handleTimeSelect(slot.time)}
                  disabled={!slot.available}
                  variant={selectedTime === slot.time ? 'default' : 'outline'}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          ) : selectedDate ? (
            <p className="text-sm text-muted-foreground">No available time slots for this date</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Please select a date to see available time slots
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="w-full"
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedTime || loading}
          className="w-full ml-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
