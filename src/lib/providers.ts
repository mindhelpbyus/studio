import { PlaceHolderImages } from './placeholder-images';

export type Provider = {
  id: string;
  name: string;
  specialty: string;
  location: string;
  imageUrl: string;
  imageHint: string;
};

// Using an array to simulate a collection in a database.
const providers: Provider[] = [
  {
    id: '1',
    name: 'Dr. Evelyn Reed',
    specialty: 'Cardiology',
    location: 'New York, NY',
    imageUrl: 'https://picsum.photos/seed/provider1/400/400',
    imageHint: 'doctor portrait',
  },
  {
    id: '2',
    name: 'Dr. Samuel Chen',
    specialty: 'Pediatrics',
    location: 'San Francisco, CA',
    imageUrl: 'https://picsum.photos/seed/provider2/400/400',
    imageHint: 'doctor smiling',
  },
  {
    id: '3',
    name: 'Dr. Maria Garcia',
    specialty: 'Dermatology',
    location: 'Miami, FL',
    imageUrl: 'https://picsum.photos/seed/provider3/400/400',
    imageHint: 'female doctor',
  },
  {
    id: '4',
    name: 'Dr. Ben Carter',
    specialty: 'Neurology',
    location: 'Chicago, IL',
    imageUrl: 'https://picsum.photos/seed/provider4/400/400',
    imageHint: 'male doctor',
  },
  {
    id: '5',
    name: 'Dr. Aisha Khan',
    specialty: 'Oncology',
    location: 'Houston, TX',
    imageUrl: 'https://picsum.photos/seed/provider5/400/400',
    imageHint: 'doctor portrait professional',
  },
  {
    id: '6',
    name: 'Dr. David Lee',
    specialty: 'General Practice',
    location: 'Los Angeles, CA',
    imageUrl: 'https://picsum.photos/seed/provider6/400/400',
    imageHint: 'friendly doctor',
  },
];


export const providersDb = {
  findAll: async (): Promise<Provider[]> => {
    return providers;
  },

  findById: async (id: string): Promise<Provider | undefined> => {
    return providers.find(p => p.id === id);
  },
};
