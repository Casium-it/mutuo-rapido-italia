
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
          src="/lovable-uploads/1d6c5c4e-8be0-4824-afef-4fa998aa72d7.png"
          alt="GoMutuo Logo"
          height="32"
          className="h-8"
        />
    </div>
  );
}
