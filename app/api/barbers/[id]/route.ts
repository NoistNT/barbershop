import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { barbers } from '@/lib/db/schema';

export async function GET({ params }: { params: { id: string } }) {
  try {
    const barber = await db.query.barbers.findFirst({ where: eq(barbers.id, params.id) });

    if (!barber) return NextResponse.json({ error: 'Barber not found' }, { status: 404 });

    return NextResponse.json(barber);
  } catch (error) {
    console.error('Error fetching barber:', error);
    return NextResponse.json({ error: 'Failed to fetch barber' }, { status: 500 });
  }
}
