
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FormProvider } from "@/contexts/FormContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { usePageTracking } from "@/hooks/usePageTracking";
import { allBlocks } from "@/data/blocks";
import SimulazioneAvanzata from "./pages/SimulazioneAvanzata";
import Form from "./pages/Form";
import FormCompleted from "./pages/FormCompleted";
import FormLoading from "./pages/FormLoading";
import ResumeSimulation from "./pages/ResumeSimulation";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Simulazioni from "./pages/Simulazioni";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminBlocks from "./pages/AdminBlocks";
import AdminBlockDetail from "./pages/AdminBlockDetail";
import AdminFormDetail from "./pages/AdminFormDetail";
import AdminNotifications from "./pages/AdminNotifications";

const queryClient = new QueryClient();

// Component to track page views inside Router context
const AppWithTracking = () => {
  usePageTracking();
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/simulazione-avanzata" element={<SimulazioneAvanzata />} />
      <Route path="/simulazione-avanzata/:slug" element={<SimulazioneAvanzata />} />
      <Route path="/riprendi-simulazione" element={<ResumeSimulation />} />
      <Route path="/simulazione/:blockType/:blockId/:questionId" element={
        <FormProvider blocks={allBlocks}>
          <Form />
        </FormProvider>
      } />
      <Route path="/form-loading" element={<FormLoading />} />
      <Route path="/form-completed" element={<FormCompleted />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/simulazioni" element={<Simulazioni />} />
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin>
          <Admin />
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
      <Route path="/admin/form/:submissionId" element={
        <ProtectedRoute requireAdmin>
          <AdminFormDetail />
        </ProtectedRoute>
      } />
      <Route path="/admin/notifications" element={
        <ProtectedRoute requireAdmin>
          <AdminNotifications />
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
