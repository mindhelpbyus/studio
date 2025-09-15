import { Briefcase } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="Vivalé Home">
      <Briefcase className="h-8 w-8 text-primary" />
      <span className="font-headline text-2xl font-bold text-gradient">
        Vivalé
      </span>
    </div>
  );
}
