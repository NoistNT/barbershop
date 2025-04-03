import { db } from '@/lib/db/index';
import { appointments, barbers, services, users, workingHours } from '@/lib/db/schema';

const usersData = [
  {
    id: crypto.randomUUID(),
    name: 'John Doe',
    email: 'john@example.com',
    role: 'customer',
  },
  {
    id: crypto.randomUUID(),
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'customer',
  },
  {
    id: crypto.randomUUID(),
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'barber',
  },
  {
    id: crypto.randomUUID(),
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    role: 'barber',
  },
  {
    id: crypto.randomUUID(),
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  },
];

const barbersData = [
  {
    id: usersData.find((u) => u.email === 'mike@example.com')!.id,
    name: 'Mike Johnson',
    bio: 'Master barber with 10 years of experience specializing in classic cuts and beard grooming.',
    photo:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    isActive: true,
  },
  {
    id: usersData.find((u) => u.email === 'sarah@example.com')!.id,
    name: 'Sarah Williams',
    bio: 'Creative stylist passionate about modern haircuts and coloring techniques.',
    photo:
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    isActive: true,
  },
];

const servicesData = [
  {
    id: crypto.randomUUID(),
    name: 'Classic Haircut',
    description: 'Traditional haircut with scissors and clippers',
    duration: 30,
    price: 25,
  },
  {
    id: crypto.randomUUID(),
    name: 'Premium Haircut',
    description: 'Haircut with hot towel treatment and styling',
    duration: 45,
    price: 35,
  },
  {
    id: crypto.randomUUID(),
    name: 'Beard Trim',
    description: 'Beard shaping and trimming with hot towel',
    duration: 15,
    price: 15,
  },
  {
    id: crypto.randomUUID(),
    name: 'Haircut + Beard',
    description: 'Complete grooming package',
    duration: 45,
    price: 40,
  },
  {
    id: crypto.randomUUID(),
    name: 'Kids Haircut',
    description: 'Special cut for children under 12',
    duration: 30,
    price: 20,
  },
];

async function seedDatabase() {
  // Clear existing data
  await db.delete(appointments);
  await db.delete(workingHours);
  await db.delete(services);
  await db.delete(barbers);
  await db.delete(users);

  // Seed Users
  const userData = await db.insert(users).values(usersData).returning();

  // Seed Barbers
  const barberData = await db.insert(barbers).values(barbersData).returning();

  // Seed Services
  const serviceData = await db.insert(services).values(servicesData).returning();

  // Seed Working Hours (Monday-Friday for both barbers)
  const workingHourData = [];

  for (let day = 1; day < 6; day++) {
    // Monday to Friday
    workingHourData.push(
      {
        id: crypto.randomUUID(),
        barberId: barberData[0].id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
      },
      {
        id: crypto.randomUUID(),
        barberId: barberData[1].id,
        dayOfWeek: day,
        startTime: '10:00',
        endTime: '18:00',
      }
    );
  }

  // Add Saturday hours for Mike only
  workingHourData.push({
    id: crypto.randomUUID(),
    barberId: barberData[0].id,
    dayOfWeek: 6, // Saturday
    startTime: '10:00',
    endTime: '15:00',
  });

  await db.insert(workingHours).values(workingHourData);

  // Seed Some Appointments
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Helper function to create UTC dates
  const createUTCDate = (date: Date, hours: number, minutes: number) => {
    const utcDate = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours, minutes)
    );
    return utcDate;
  };

  const appointmentsData = [
    {
      id: crypto.randomUUID(),
      userId: userData.find((u) => u.email === 'john@example.com')!.id,
      barberId: barberData[0].id,
      serviceId: serviceData.find((s) => s.name === 'Classic Haircut')!.id,
      startTime: createUTCDate(now, 11, 0), // 11:00 UTC
      endTime: createUTCDate(now, 11, 30), // 11:30 UTC
      status: 'confirmed',
      createdAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      userId: userData.find((u) => u.email === 'jane@example.com')!.id,
      barberId: barberData[1].id,
      serviceId: serviceData.find((s) => s.name === 'Premium Haircut')!.id,
      startTime: createUTCDate(tomorrow, 14, 0), // 14:00 UTC tomorrow
      endTime: createUTCDate(tomorrow, 14, 45), // 14:45 UTC tomorrow
      status: 'confirmed',
      createdAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      userId: userData.find((u) => u.email === 'john@example.com')!.id,
      barberId: barberData[0].id,
      serviceId: serviceData.find((s) => s.name === 'Beard Trim')!.id,
      startTime: createUTCDate(now, 15, 0), // 15:00 UTC today
      endTime: createUTCDate(now, 15, 20), // 15:20 UTC today
      status: 'confirmed',
      createdAt: new Date(),
    },
  ];

  await db.insert(appointments).values(appointmentsData);
}

seedDatabase().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
