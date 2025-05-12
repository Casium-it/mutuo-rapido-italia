
import React from "react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="gradient-bg rounded-md p-1.5">
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z" 
            fill="white"
          />
        </svg>
      </div>
      <h1 className="font-bold text-xl">GoMutuo<span className="text-vibe-green">.it</span></h1>
    </div>
  );
}
