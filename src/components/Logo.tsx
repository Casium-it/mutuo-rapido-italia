
import React from "react";

interface LogoProps {
  onClick?: () => void;
}

export function Logo({ onClick }: LogoProps) {
  return (
    <div 
      className={`flex items-center gap-2 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
        <img 
          src="/lovable-uploads/fc4caaa9-75d9-4960-92f3-7afba05a26e9.png"
          alt="GoMutuo Logo"
          height="40"
          className="h-10"
        />
    </div>
  );
}
