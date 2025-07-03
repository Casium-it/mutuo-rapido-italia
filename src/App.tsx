import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import AdminBlocks from './pages/AdminBlocks';
import AdminBlockDetail from './pages/AdminBlockDetail';
import AdminFormDetail from './pages/AdminFormDetail';
import AdminNotifications from './pages/AdminNotifications';
import NotFound from './pages/NotFound';
import Form from './pages/Form';
import FormCompleted from './pages/FormCompleted';
import FormLoading from './pages/FormLoading';
import Simulazioni from './pages/Simulazioni';
import SimulazioneAvanzata from './pages/SimulazioneAvanzata';
import ResumeSimulation from './pages/ResumeSimulation';
import Privacy from './pages/Privacy';
import { FormRouteHandler } from '@/components/form/FormRouteHandler';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Home page */}
            <Route path="/" element={<Home />} />
            
            {/* Authentication */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Privacy policy */}
            <Route path="/privacy" element={<Privacy />} />
            
            {/* Database-driven form routes - with support for block/question navigation */}
            <Route path="/form/:formSlug" element={<FormRouteHandler />} />
            <Route path="/form/:formSlug/:blockId" element={<FormRouteHandler />} />
            <Route path="/form/:formSlug/:blockId/:questionId" element={<FormRouteHandler />} />

            {/* Legacy form routes - keeping for backward compatibility */}
            <Route path="/form" element={<FormRouteHandler />} />

            {/* Form completion */}
            <Route path="/form-completed" element={<FormCompleted />} />
            <Route path="/form-loading" element={<FormLoading />} />
            
            {/* Simulations */}
            <Route path="/simulazioni" element={<Simulazioni />} />
            <Route path="/simulazione-avanzata" element={<SimulazioneAvanzata />} />
            <Route path="/resume-simulation" element={<ResumeSimulation />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/admin/blocks" element={
              <ProtectedRoute>
                <AdminBlocks />
              </ProtectedRoute>
            } />
            <Route path="/admin/blocks/:blockId" element={
              <ProtectedRoute>
                <AdminBlockDetail />
              </ProtectedRoute>
            } />
            <Route path="/admin/forms/:submissionId" element={
              <ProtectedRoute>
                <AdminFormDetail />
              </ProtectedRoute>
            } />
            <Route path="/admin/notifications" element={
              <ProtectedRoute>
                <AdminNotifications />
              </ProtectedRoute>
            } />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
