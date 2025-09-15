
export function LogoIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8"
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'var(--accent-left)' }} />
          <stop offset="50%" style={{ stopColor: 'var(--accent-mid)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--accent-right)' }} />
        </linearGradient>
      </defs>
      <path
        d="M18 5C12.48 5 8 9.48 8 15C8 22.25 18 31.5 18 31.5C18 31.5 28 22.25 28 15C28 9.48 23.52 5 18 5Z"
        stroke="url(#logo-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 18H15L18 12L21 18H24"
        stroke="url(#logo-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
