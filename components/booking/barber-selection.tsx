'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { Barber } from '@/types/service';

export default function BarberSelection({
  serviceId,
  onBack,
  onNext,
}: {
  serviceId: string;
  onBack: () => void;
  onNext: (barberId: string) => void;
}) {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/barbers?serviceId=${serviceId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch barbers');
        }

        const data = await response.json();
        setBarbers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchBarbers();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 rounded bg-red-50">Error: {error}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Select Your Barber</h2>

      <div className="grid grid-cols-1 gap-4 mb-6">
        {barbers.map(({ id, bio, name, photo }) => (
          <div
            key={id}
            className="p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
            onClick={() => onNext(id)}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-full overflow-hidden">
                {photo && (
                  <img
                    src={photo}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/default-barber.jpg';
                    }}
                  />
                )}
              </div>
              <div>
                <h3 className="font-medium">{name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{bio}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={onBack}
      >
        Back
      </Button>
    </div>
  );
}
