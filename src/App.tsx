
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Form from "./pages/Form";
import FormCompleted from "./pages/FormCompleted";
import FormLoading from "./pages/FormLoading";
import ResumeSimulation from "./pages/ResumeSimulation";
import Simulazioni from "./pages/Simulazioni";
import SimulazioneAvanzata from "./pages/SimulazioneAvanzata";
import Privacy from "./pages/Privacy";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminBlocks from "./pages/AdminBlocks";
import AdminBlockDetail from "./pages/AdminBlockDetail";
import AdminFormDetail from "./pages/AdminFormDetail";
import AdminNotifications from "./pages/AdminNotifications";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { FormRouteHandler } from "./components/form/FormRouteHandler";

// Import debuggers for global availability
import { cacheDebugger } from "@/utils/cacheDebugger";
import { formStateDebugger } from "@/utils/formStateDebugger";

import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/admin/blocks" element={<ProtectedRoute><AdminBlocks /></ProtectedRoute>} />
              <Route path="/admin/blocks/:blockId" element={<ProtectedRoute><AdminBlockDetail /></ProtectedRoute>} />
              <Route path="/admin/forms/:formId" element={<ProtectedRoute><AdminFormDetail /></ProtectedRoute>} />
              <Route path="/admin/notifications" element={<ProtectedRoute><AdminNotifications /></ProtectedRoute>} />
              <Route path="/simulazioni" element={<Simulazioni />} />
              <Route path="/simulazione-avanzata" element={<SimulazioneAvanzata />} />
              <Route path="/riprendi-simulazione" element={<ResumeSimulation />} />
              <Route path="/form-loading" element={<FormLoading />} />
              <Route path="/form-completed" element={<FormCompleted />} />
              
              {/* Form routes */}
              <Route path="/form/:formSlug" element={<FormRouteHandler />} />
              <Route path="/form/:formSlug/:blockId" element={<FormRouteHandler />} />
              <Route path="/form/:formSlug/:blockId/:questionId" element={<FormRouteHandler />} />
              
              {/* Legacy form routes */}
              <Route path="/simulazione/:blockType" element={<Form />} />
              <Route path="/simulazione/:blockType/:blockId" element={<Form />} />
              <Route path="/simulazione/:blockType/:blockId/:questionId" element={<Form />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
