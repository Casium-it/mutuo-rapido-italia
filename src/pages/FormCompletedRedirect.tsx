import React, { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function FormCompletedRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const submissionData = location.state?.submissionData;

  useEffect(() => {
    if (!submissionData) {
      console.log("No submission data found, redirecting to home");
      navigate("/");
      return;
    }
  }, [submissionData, navigate]);

  if (!submissionData) {
    return null;
  }

  const handleRedirectToPortal = () => {
    window.open("https://portale.gomutuo.it/auth", "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f5f1]">
      {/* Header */}
      <header className="py-6 px-4 md:px-6 flex justify-between items-center">
        <Link to="/">
          <Logo />
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 md:px-6 py-8 md:py-12 max-w-3xl mx-auto w-full">
        {/* Completion Card */}
        <div className="bg-white rounded-[12px] border border-[#BEB8AE] shadow-[0_3px_0_0_#AFA89F] hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)] transition-all p-8 mb-8 py-[20px] px-[21px]">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-[#245C4F] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Form completato, dati salvati
            </h1>
            
            <p className="text-sm text-gray-600">
              ora puoi chiudere questa schermata e tornare al portale, o clicca qui sotto
            </p>
            
            <Button 
              onClick={handleRedirectToPortal}
              className="w-full px-[32px] py-[14px] border-[1.5px] rounded-[10px] 
                font-['Inter'] text-[17px] font-medium transition-all
                shadow-[0_3px_0_0_#1a453e] mb-[10px]
                hover:shadow-[0_3px_4px_rgba(36,92,79,0.25)]
                active:shadow-[0_1px_0_0_#1a453e] active:translate-y-[2px]
                inline-flex items-center justify-center gap-[12px]
                bg-[#245C4F] text-white border-[#245C4F]
                cursor-pointer hover:bg-[#1e4f44]"
            >
              Torna al portale
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 bg-gray-50 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} GoMutuo. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
}