
import React from 'react';
import { LoginButton } from './LoginButton';

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#BEB8AE] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* CTA Section nel footer */}
        <div className="text-center mb-8 p-6 bg-[#f7f5f2] rounded-lg">
          <h3 className="text-xl font-semibold text-[#245C4F] mb-2">
            Pronto per il tuo mutuo?
          </h3>
          <p className="text-gray-600 mb-4">Inizia subito la simulazione, è gratis e senza impegno</p>
          <button 
            onClick={() => window.location.href = '/simulazioni'}
            className="bg-[#245C4F] hover:bg-[#1e4f44] text-white px-6 py-3 rounded-[12px] shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37] transition-all relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            Simula ora
          </button>
        </div>
        
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
