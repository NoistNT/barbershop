'use client';

import { useEffect, useState } from 'react';

import type { Service } from '@/types/service';

interface OnNext {
  (serviceId: string): void;
}

export default function ServiceSelection({ onNext }: { onNext: OnNext }) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) return <div>Loading services...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Select a Service</h2>
      <div className="space-y-2">
        {services.map(({ id, name, duration, price }) => (
          <div
            key={id}
            className="p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors text-sm text-muted-foreground max-w-prose mx-auto"
            onClick={() => onNext(id)}
          >
            <h3 className="font-medium text-base text-foreground">{name}</h3>
            <p>Duration: {duration} minutes</p>
            <p>Price: ${price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
