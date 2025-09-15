
import { LogoIcon } from './logo-icon';

export function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="Vivalé Home">
      <LogoIcon />
      <span className="font-headline text-2xl font-bold hover-text-gradient">
        Vivalé
      </span>
    </div>
  );
}
