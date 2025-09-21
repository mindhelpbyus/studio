export function AnimatedLogoIcon() {
  return (
    <div className="relative w-10 h-10 transition-transform duration-300 hover:scale-110">
      <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: '#C084FC'}} />
            <stop offset="50%" style={{stopColor: '#EC4899'}} />
            <stop offset="100%" style={{stopColor: '#F59E0B'}} />
          </linearGradient>
        </defs>
        
        {/* Simple heart-like logo */}
        <g transform="translate(50, 50)">
          <path 
            d="M 0,-20 C -15,-35 -40,-35 -40,-10 C -40,15 0,40 0,40 C 0,40 40,15 40,-10 C 40,-35 15,-35 0,-20 Z"
            fill="url(#logoGrad)"
            className="drop-shadow-sm"
          />
          
          {/* Arrow element */}
          <path 
            d="M 10,-5 L 25,-20 L 20,-25 L 35,-10 L 20,5 L 25,0 L 10,15"
            fill="url(#logoGrad)"
            opacity="0.8"
          />
        </g>
      </svg>
    </div>
  );
}