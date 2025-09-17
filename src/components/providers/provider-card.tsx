
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Provider } from '@/lib/providers';
import { Badge } from '../ui/badge';
import { MapPin } from 'lucide-react';
import Link from 'next/link';

type ProviderCardProps = {
  provider: Provider;
  priority?: boolean;
};

export function ProviderCard({ provider, priority = false }: ProviderCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-card transition-all duration-300 hover:scale-105 hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative h-56 w-full">
          <Image
            src={provider.imageUrl}
            alt={`Portrait of ${provider.name}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint={provider.imageHint}
            priority={priority}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-6">
        <Badge variant="secondary" className="w-fit">
          {provider.specialty}
        </Badge>
        <CardTitle className="mt-4 text-2xl font-bold">{provider.name}</CardTitle>
        <CardDescription className="mt-2 flex items-center gap-2 text-muted-foreground">
          <MapPin size={16} />
          {provider.location}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Link href={`/providers/${provider.id}/book`} className='w-full'>
            <Button className="w-full">Book Appointment</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
