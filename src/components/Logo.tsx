
import React from "react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-md p-1">
        <img 
          src="/lovable-uploads/125791dc-7151-4965-999e-8cdadefd67ef.png"
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
