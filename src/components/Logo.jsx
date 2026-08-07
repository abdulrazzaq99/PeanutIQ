import { Bean, Leaf } from 'lucide-react';

export default function Logo({ className = "w-6 h-6", iconColor = "currentColor", sparkleColor = "#E5A93D" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Bean/Peanut icon for the agricultural aspect */}
      <Bean className="w-full h-full" strokeWidth={1.5} style={{ color: iconColor }} />
      {/* A small leaf growing from it instead of AI sparkles for a natural, humanized vibe */}
      <Leaf 
        className="absolute -top-1 -right-1 w-[55%] h-[55%] -rotate-12" 
        style={{ color: sparkleColor }}
        fill="currentColor"
        strokeWidth={1.5}
      />
    </div>
  );
}
