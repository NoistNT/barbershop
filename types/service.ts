export interface ServiceProps {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  active: boolean;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export interface Barber {
  id: string;
  name: string;
  bio: string;
  photo: string;
}
