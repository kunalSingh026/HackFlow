import React from 'react';

const Logo = ({ size = 20, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="logo-bracket-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ede6ff" />
          <stop offset="100%" stopColor="#afacca" />
        </linearGradient>
        <linearGradient id="logo-flow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" /> {/* Purple-400 */}
          <stop offset="50%" stopColor="#f472b6" /> {/* Pink-400 */}
          <stop offset="100%" stopColor="#60a5fa" /> {/* Blue-400 */}
        </linearGradient>

        {/* Glow Filter */}
        <filter id="logo-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid structure lines in background (subtle) */}
      <line
        x1="16"
        y1="4"
        x2="16"
        y2="28"
        stroke="#595388"
        strokeWidth="0.5"
        strokeDasharray="1 3"
        opacity="0.3"
      />
      <line
        x1="4"
        y1="16"
        x2="28"
        y2="16"
        stroke="#595388"
        strokeWidth="0.5"
        strokeDasharray="1 3"
        opacity="0.3"
      />

      {/* Left Code Bracket "<" */}
      <path
        d="M9 10L3 16L9 22"
        stroke="url(#logo-bracket-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right Code Bracket ">" */}
      <path
        d="M23 10L29 16L23 22"
        stroke="url(#logo-bracket-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Glowing Flow Wave */}
      <path
        d="M4 16C10 7, 12 25, 16 16C19 9, 23 16, 28 16"
        stroke="url(#logo-flow-grad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#logo-glow)"
        className="logo-flow-line"
      />

      {/* Glowing Central Processing Node */}
      <circle cx="16" cy="16" r="3" fill="#f7f6f0" filter="url(#logo-glow)" />
      <circle cx="16" cy="16" r="1.2" fill="#595388" />

      {/* Node terminals */}
      <circle cx="8" cy="13.5" r="1" fill="#ede6ff" />
      <circle cx="24" cy="18.5" r="1" fill="#ede6ff" />
    </svg>
  );
};

export default Logo;
