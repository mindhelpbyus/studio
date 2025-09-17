import { AnimatedLogoIcon } from './animated-logo-icon';

export function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="Vivalé Home">
      <AnimatedLogoIcon />
      <span className="font-headline text-3xl font-extrabold hover-text-gradient">
        Vivalé
      </span>
    </div>
  );
}
