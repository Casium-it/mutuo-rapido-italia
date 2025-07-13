import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FormProvider } from "@/contexts/FormContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useFormCache } from "@/hooks/useFormCache";
import { allBlocks } from "@/data/blocks";
import { useEffect, useState } from "react";
import { formCacheService } from "@/services/formCacheService";
import SimulazioneAvanzata from "./pages/SimulazioneAvanzata";
import FormLauncher from "./components/FormLauncher";
import Form from "./pages/Form";
import FormCompleted from "./pages/FormCompleted";
import FormCompletedRedirect from "./pages/FormCompletedRedirect";
import FormLoading from "./pages/FormLoading";
import ResumeSimulation from "./pages/ResumeSimulation";
import AutoResumeSimulation from "./pages/AutoResumeSimulation";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Simulazioni from "./pages/Simulazioni";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminLeads from "./pages/AdminLeads";
import AdminSimulations from "./pages/AdminSimulations";
import AdminBlocks from "./pages/AdminBlocks";
import AdminBlockDetail from "./pages/AdminBlockDetail";

import AdminSimulationDetail from "./pages/AdminSimulationDetail";
import AdminNotifications from "./pages/AdminNotifications";
import AdminForms from "./pages/AdminForms";

const queryClient = new QueryClient();

// Component to track page views inside Router context
const AppWithTracking = () => {
  usePageTracking();
  const [cacheInitialized, setCacheInitialized] = useState(false);

  // Initialize form cache on app startup
  useEffect(() => {
    const initializeCache = async () => {
      try {
        console.log('🚀 Initializing form cache system...');
        await formCacheService.loadAndCacheAllForms();
        setCacheInitialized(true);
        console.log('✅ Form cache system initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize form cache, using fallback:', error);
        // Set initialized to true anyway to allow app to work with static blocks
        setCacheInitialized(true);
      }
    };

    initializeCache();
  }, []);
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/simulazione-avanzata" element={<SimulazioneAvanzata />} />
      <Route path="/simulazione-avanzata/:slug" element={<SimulazioneAvanzata />} />
      <Route path="/riprendi-simulazione" element={<ResumeSimulation />} />
      <Route path="/riprendi/:code" element={<AutoResumeSimulation />} />
      
      {/* New simplified form route using FormLauncher */}
      <Route path="/simulazione/:formSlug/:blockId/:questionId" element={<FormLauncher />} />
      
      <Route path="/form-loading" element={<FormLoading />} />
      <Route path="/form-completed" element={<FormCompleted />} />
      <Route path="/form-completed-redirect" element={<FormCompletedRedirect />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/simulazioni" element={<Simulazioni />} />
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin>
          <Admin />
        </ProtectedRoute>
      } />
      <Route path="/admin/leads" element={
        <ProtectedRoute requireAdmin>
          <AdminLeads />
        </ProtectedRoute>
      } />
      <Route path="/admin/simulations" element={
        <ProtectedRoute requireAdmin>
          <AdminSimulations />
        </ProtectedRoute>
      } />
      <Route path="/admin/simulations/:simulationId" element={
        <ProtectedRoute requireAdmin>
          <AdminSimulationDetail />
        </ProtectedRoute>
      } />
      <Route path="/admin/blocks" element={
        <ProtectedRoute requireAdmin>
          <AdminBlocks />
        </ProtectedRoute>
      } />
      <Route path="/admin/blocks/:blockId" element={
        <ProtectedRoute requireAdmin>
          <AdminBlockDetail />
        </ProtectedRoute>
      } />
      <Route path="/admin/notifications" element={
        <ProtectedRoute requireAdmin>
          <AdminNotifications />
        </ProtectedRoute>
      } />
      <Route path="/admin/forms" element={
        <ProtectedRoute requireAdmin>
          <AdminForms />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppWithTracking />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
