import React from 'react';

const RobotFace = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-white/30" strokeWidth="1" />
    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" className="text-white/30" strokeWidth="1" />
    <path d="M 50 20 L 50 12" stroke="#f0c169" strokeWidth="3" strokeLinecap="round" />
    <circle cx="50" cy="10" r="3" fill="#f0c169" />
    <defs>
      <radialGradient id="headGrad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
        <stop offset="0%" stopColor="#F9FAFB" />
        <stop offset="100%" stopColor="#E5E7EB" />
      </radialGradient>
    </defs>
    <circle cx="50" cy="55" r="30" fill="url(#headGrad)" />
    <rect x="38" y="45" width="4" height="12" rx="2" fill="#07571C" />
    <rect x="58" y="45" width="4" height="12" rx="2" fill="#07571C" />
    <rect x="42" y="68" width="16" height="4" rx="2" fill="#07571C" />
  </svg>
);

export default RobotFace;
