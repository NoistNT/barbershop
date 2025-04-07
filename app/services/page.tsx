'use client';

import { useEffect, useState } from 'react';

import type { ServiceProps } from '@/types/service';

export default function Page() {
  const [services, setServices] = useState<ServiceProps[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);

  return (
    <div>
      <h1>Services</h1>
      <ul>
        {services.map((service) => (
          <li key={service.id}>
            <h2>{service.name}</h2>
            <p>{service.description}</p>
            <p>Price: ${service.price}</p>
            <p>Duration: {service.duration} minutes</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
