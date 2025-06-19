
import React from 'react';
import { LoginButton } from './LoginButton';

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#BEB8AE] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-gray-600 text-sm">
              © 2024 GoMutuo. Tutti i diritti riservati.
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <a 
              href="/privacy" 
              className="text-gray-600 hover:text-[#245C4F] text-sm transition-colors"
            >
              Privacy Policy
            </a>
            <LoginButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
