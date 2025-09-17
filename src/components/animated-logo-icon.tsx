import Image from 'next/image';

export function AnimatedLogoIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#F06292', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#8E24AA', stopOpacity: 1}} />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#FFA726', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#FF7043', stopOpacity: 1}} />
        </linearGradient>
      </defs>
      <g transform="translate(5, 5)">
        <path d="M 83.3,16.7 C 73.3,3.3 55,0 41.7,10 C 28.3,20 25,38.3 35,51.7 C 38.3,56.7 43.3,60 50,60" fill="none" stroke="url(#grad2)" strokeWidth="3" strokeLinecap="round" />
        <path d="M 83.3,16.7 C 73.3,3.3 55,0 41.7,10 C 28.3,20 25,38.3 35,51.7" fill="none" stroke="#FFCDD2" strokeWidth="0.5" />
        <path d="M 80,20 C 70,7 53,4 40,14 C 27,24 24,42.3 34,55.7" fill="none" stroke="#FFCDD2" strokeWidth="0.5" />
        <path d="M 76.7,23.3 C 66.7,10.3 49,8 37,18 C 24,28 21,46.3 31,59.7" fill="none" stroke="#FFCDD2" strokeWidth="0.5" />

        <path d="M 16.7,83.3 C 26.7,96.7 45,100 58.3,90 C 71.7,80 75,61.7 65,48.3 C 61.7,43.3 56.7,40 50,40" fill="none" stroke="url(#grad1)" strokeWidth="3" strokeLinecap="round" />
        <path d="M 16.7,83.3 C 26.7,96.7 45,100 58.3,90 C 71.7,80 75,61.7 65,48.3" fill="none" stroke="#E1BEE7" strokeWidth="0.5" />
        <path d="M 20,80 C 30,93 47,96 60,86 C 73,76 76,57.7 66,44.3" fill="none" stroke="#E1BEE7" strokeWidth="0.5" />
        <path d="M 23.3,76.7 C 33.3,89.7 51,92 63,82 C 76,72 79,53.7 69,40.3" fill="none" stroke="#E1BEE7" strokeWidth="0.5" />
      </g>
    </svg>
  );
}