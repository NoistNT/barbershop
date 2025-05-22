import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { barbers } from '@/lib/db/schema';

export async function GET() {
  try {
    const barberList = await db.select().from(barbers).where(eq(barbers.isActive, true));
    return NextResponse.json(barberList);
  } catch (error) {
    console.error('Error fetching barbers:', error);
    return NextResponse.json({ error: 'Failed to fetch barbers' }, { status: 500 });
  }
}
