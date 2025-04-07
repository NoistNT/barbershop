import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { barbers } from '@/lib/db/schema';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    let query = db.select().from(barbers).where(eq(barbers.isActive, true));

    if (serviceId) {
      // TODO: Join with a barber_services table
      // eslint-disable-next-line no-self-assign
      query = query;
    }

    const barberList = await query;
    return NextResponse.json(barberList);
  } catch (error) {
    console.error('Error fetching barbers:', error);
    return NextResponse.json({ error: 'Failed to fetch barbers' }, { status: 500 });
  }
}
