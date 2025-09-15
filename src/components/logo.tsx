import { HeartPulse } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="MediVision AI Home">
      <HeartPulse className="h-8 w-8 text-primary" />
      <span className="font-headline text-2xl font-bold text-primary">
        MediVision AI
      </span>
    </div>
  );
}
