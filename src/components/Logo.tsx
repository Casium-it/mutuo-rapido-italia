
import React from "react";

interface LogoProps {
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ onClick, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10', 
    lg: 'h-12',
    xl: 'h-16'
  };

  return (
    <div 
      className={`flex items-center gap-2 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
        <img 
          src="/lovable-uploads/f8bbfaf2-359b-44d7-ad1c-d0c6c30ff620.png"
          alt="GoMutuo Logo"
          className={sizeClasses[size]}
        />
    </div>
  );
}
