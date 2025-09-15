export function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="Vivalé Home">
      <svg
        width="36"
        height="36"
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary h-8 w-8"
      >
        {/* The 'V' as a pulse line */}
        <path
          d="M6 25H12L16 18L20 32L24 25H28"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Orbit for 'Mind' */}
        <path
          d="M34 11C41.732 18.732 38.4853 31.4853 30.7533 39.2173"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Abstract head for 'Mind' */}
        <circle cx="31.5" cy="40.5" r="2" fill="currentColor" />

        {/* Orbit for 'Therapy' */}
        <path
          d="M16 39C8.26801 31.268 11.5147 18.5147 19.2467 10.7827"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Leaf for 'Therapy' */}
        <path
          d="M18.5 9.5C19.5 8.5 21 8 22 9C23 10 22.5 11.5 21.5 12.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span className="font-headline text-2xl font-bold hover-text-gradient">
        ivalé
      </span>
    </div>
  );
}
