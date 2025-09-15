export function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="Vivalé Home">
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary h-8 w-8"
      >
        <path
          d="M18 33.3C11.4 27.6 6 22.2 6 15.9C6 11.0145 9.80558 7.2 14.7 7.2C17.25 7.2 19.65 8.55 21.15 10.5L18 13.5L14.25 13.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M23.2494 10.5C24.7494 8.55 27.1494 7.2 29.6994 7.2C34.5948 7.2 38.3994 11.0145 38.3994 15.9C38.3994 22.2 32.9994 27.6 26.3994 33.3L18.0001 24.9"
          stroke="currentColor"
  strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
         <path 
          d="M6 18H12L15 22.5L21 13.5L24 18H30" 
          stroke="currentColor"
          strokeWidth="2"
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