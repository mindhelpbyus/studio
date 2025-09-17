export function AnimatedLogoIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="h-9 w-9 animate-logo-spin"
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--secondary))" />
          <stop offset="100%" stopColor="hsl(var(--primary))" />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffc39b" />
          <stop offset="100%" stopColor="hsl(var(--destructive))" />
        </linearGradient>
      </defs>

      {/* Bottom-left element */}
      <g transform="translate(50 50) rotate(45) translate(-50 -50)">
        <path
          d="M 25,75 C 10,75 10,50 25,50 S 40,25 50,25"
          fill="none"
          stroke="url(#grad1)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {Array.from({ length: 10 }).map((_, i) => (
          <path
            key={i}
            d={`M 25,75 C ${10 + i * 1.5},75 10,${50 + i * 2.5} 25,${50 + i * 2.5}`}
            fill="none"
            stroke="url(#grad1)"
            strokeWidth="1"
            opacity="0.6"
          />
        ))}
      </g>
      
      {/* Top-right element */}
      <g transform="translate(50 50) rotate(225) translate(-50 -50)">
        <path
          d="M 25,75 C 10,75 10,50 25,50 S 40,25 50,25"
          fill="none"
          stroke="url(#grad2)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {Array.from({ length: 10 }).map((_, i) => (
          <path
            key={i}
            d={`M 25,75 C ${10 + i * 1.5},75 10,${50 + i * 2.5} 25,${50 + i * 2.5}`}
            fill="none"
            stroke="url(#grad2)"
            strokeWidth="1"
            opacity="0.6"
          />
        ))}
      </g>
    </svg>
  );
}
