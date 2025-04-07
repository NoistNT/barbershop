import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to Barbershop</h1>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/booking">Book Now</Link>
        </Button>
        <Button
          variant="outline"
          asChild
        >
          <Link href="/services">View Services</Link>
        </Button>
      </div>
    </main>
  );
}
