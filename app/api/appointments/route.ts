import { and, eq, gte, lte, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { appointments } from '@/lib/db/schema';

export async function POST(request: Request) {
  try {
    // Extract userId from authenticated session or request body
    const { serviceId, barberId, startTime, userId } = await request.json();

    if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

    // Get service duration
    const service = await db.query.services.findFirst({
      where: (services, { eq }) => eq(services.id, serviceId),
    });

    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

    // Create date objects in UTC
    const start = new Date(startTime);
    const utcStart = new Date(
      Date.UTC(
        start.getUTCFullYear(),
        start.getUTCMonth(),
        start.getUTCDate(),
        start.getUTCHours(),
        start.getUTCMinutes()
      )
    );
    const end = new Date(utcStart.getTime() + service.duration * 60000);

    // Check for conflicts
    const conflictingAppointments = await db.query.appointments.findMany({
      where: and(
        eq(appointments.barberId, barberId),
        or(
          and(gte(appointments.startTime, utcStart), lte(appointments.startTime, end)),
          and(gte(appointments.endTime, utcStart), lte(appointments.endTime, end)),
          and(lte(appointments.startTime, utcStart), gte(appointments.endTime, end))
        )
      ),
    });

    if (conflictingAppointments.length > 0) {
      console.log('Conflict found with appointments:', conflictingAppointments);
      return NextResponse.json({ error: 'Time slot is no longer available' }, { status: 409 });
    }

    // Create appointment
    const newAppointment = await db
      .insert(appointments)
      .values({
        id: crypto.randomUUID(),
        userId: 'dd86349a-475c-421c-a84d-c9e9b7be13db',
        barberId,
        serviceId,
        startTime: utcStart,
        endTime: end,
        status: 'confirmed',
        createdAt: new Date(),
      })
      .returning();

    console.log('Appointment created:', newAppointment[0]);
    return NextResponse.json(newAppointment[0], { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
