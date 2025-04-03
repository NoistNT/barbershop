import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).unique().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const services = pgTable('services', {
  id: uuid().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  duration: integer('duration').notNull(), // in minutes
  price: integer('price').notNull(),
});

export const barbers = pgTable('barbers', {
  id: uuid().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  bio: text('bio'),
  photo: varchar('photo', { length: 255 }),
  isActive: boolean('is_active').default(true),
});

export const workingHours = pgTable('working_hours', {
  id: uuid().primaryKey(),
  barberId: uuid('barber_id').references(() => barbers.id),
  dayOfWeek: integer('day_of_week').notNull(), // 0-6 (Sun-Sat)
  startTime: varchar('start_time', { length: 5 }).notNull(), // '09:00'
  endTime: varchar('end_time', { length: 5 }).notNull(), // '17:00'
});

export const appointments = pgTable('appointments', {
  id: uuid().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  barberId: uuid('barber_id').references(() => barbers.id),
  serviceId: uuid('service_id').references(() => services.id),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: varchar('status', { length: 20 }).default('confirmed'),
  createdAt: timestamp('created_at').defaultNow(),
});
