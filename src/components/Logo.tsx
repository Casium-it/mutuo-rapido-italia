
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
          src="/lovable-uploads/f8bbfaf2-359b-44d7-ad1c-d0c6c30ff620.png"
          alt="GoMutuo Logo"
          height="40"
          className="h-10"
        />
    </div>
  );
}
