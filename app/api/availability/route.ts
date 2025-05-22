import { and, eq, gte, lte } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { appointments, services, workingHours } from '@/lib/db/schema';

interface TimeSlot {
  time: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barberId = searchParams.get('barberId');
  const dateParam = searchParams.get('date');
  const serviceId = searchParams.get('serviceId');

  if (!barberId || !dateParam || !serviceId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    // Parse date in UTC to avoid timezone issues
    const date = new Date(dateParam + 'T00:00:00'); // Force local time interpretation
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    // Get service duration
    const service = await db.query.services.findFirst({
      where: eq(services.id, serviceId.toString()),
    });
    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

    // Get barber's working hours for the selected day
    const dayOfWeek = utcDate.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const workingHoursResult = await db.query.workingHours.findFirst({
      where: and(eq(workingHours.barberId, barberId), eq(workingHours.dayOfWeek, dayOfWeek)),
    });

    if (!workingHoursResult) return NextResponse.json({ availableSlots: [] }, { status: 200 });

    // Determine if selected date is today in UTC
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0); // Midnight of today in UTC
    const isToday = utcDate.getTime() === todayUTC.getTime();

    // Calculate adjusted start time
    let adjustedStartTime = workingHoursResult.startTime;

    if (isToday) {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      const [startHourStr, startMinStr] = workingHoursResult.startTime.split(':');
      const startHour = parseInt(startHourStr, 10);
      const startMinute = parseInt(startMinStr, 10);

      const workingStartMinutes = startHour * 60 + startMinute;
      const currentMinutesTotal = currentHours * 60 + currentMinutes;

      if (currentMinutesTotal < workingStartMinutes) {
        // Use working start time
        adjustedStartTime = workingHoursResult.startTime;
      } else {
        // Calculate next 30-minute interval after current time
        const nextInterval = Math.ceil(currentMinutesTotal / 30) * 30;
        const adjustedHours = Math.floor(nextInterval / 60);
        const adjustedMinutes = nextInterval % 60;

        adjustedStartTime = `${String(adjustedHours).padStart(2, '0')}:${String(adjustedMinutes).padStart(2, '0')}`;
      }
    }

    // Generate slots with adjusted start time
    const slots = generateTimeSlots(
      adjustedStartTime,
      workingHoursResult.endTime,
      service.duration
    );

    // Get existing appointments for the selected date in UTC date range
    const startOfDay = new Date(utcDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(utcDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const appointmentsResult = await db.query.appointments.findMany({
      where: and(
        eq(appointments.barberId, barberId),
        gte(appointments.startTime, startOfDay),
        lte(appointments.startTime, endOfDay)
      ),
    });

    // Mark unavailable slots
    const availableSlots = slots.map((slot) => {
      const slotTime = new Date(utcDate);
      const [hours, minutes] = slot.time.split(':').map(Number);
      slotTime.setUTCHours(hours, minutes, 0, 0);

      const isAvailable = !appointmentsResult.some((appt: typeof appointments.$inferSelect) => {
        const apptStart = new Date(appt.startTime);
        const apptEnd = new Date(appt.endTime);
        return slotTime >= apptStart && slotTime < apptEnd;
      });

      return { time: slot.time, available: isAvailable };
    });

    return NextResponse.json({ availableSlots });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 });
  }
}

function generateTimeSlots(startTime: string, endTime: string, duration: number) {
  const slots: TimeSlot[] = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  let currentHour = startHour;
  let currentMinute = startMinute;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMinute + duration <= endMinute)
  ) {
    const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    slots.push({ time: timeStr });

    currentMinute += 30;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute %= 60;
    }
  }

  return slots;
}
