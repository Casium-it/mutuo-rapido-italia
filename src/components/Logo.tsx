
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
      <div className="rounded-md p-1">
        <img 
          src="/lovable-uploads/173cb557-9ae4-40df-a6a9-79a356b8218f.png"
          alt="GoMutuo Logo"
          width="32" 
          height="32"
          className="w-8 h-8"
        />
      </div>
      <h1 className="font-bold text-xl">GoMutuo<span className="text-vibe-green">.it</span></h1>
    </div>
  );
}
