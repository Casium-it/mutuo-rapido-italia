
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
          src="/lovable-uploads/b6af0777-fd67-4a1c-b2ab-dad772d37ac6.png"
          alt="GoMutuo Logo"
          height="40"
          className="h-10"
        />
    </div>
  );
}
