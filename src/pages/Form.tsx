
import React from "react";
import { QuestionView } from "@/components/form/QuestionView";
import { BlockSidebar } from "@/components/form/BlockSidebar";
import { FormDebugPanel } from "@/components/form/FormDebugPanel";
import { ExitConfirmationDialog } from "@/components/form/ExitConfirmationDialog";
import { Logo } from "@/components/Logo";
import { usePageTracking } from "@/hooks/usePageTracking";

export default function Form() {
  // Track page visits for analytics
  usePageTracking('simulation_form');

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f5f1]">
      {/* Header */}
      <header className="py-3 px-4 md:px-6 flex justify-between items-center bg-white border-b border-gray-200">
        <Logo />
        <ExitConfirmationDialog />
      </header>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar - nascosta su mobile */}
        <div className="hidden lg:block">
          <BlockSidebar />
        </div>

        {/* Question area */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <QuestionView />
          </div>
        </main>
      </div>

      {/* Debug Panel - only in development or when explicitly enabled */}
      {(process.env.NODE_ENV === 'development' || window.location.search.includes('debug=true')) && (
        <FormDebugPanel />
      )}
    </div>
  );
}
