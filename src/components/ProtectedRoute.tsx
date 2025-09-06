
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireMediatore?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false, requireMediatore = false }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isMediatore, roleLoading, roleChecked } = useUserRole();
  const location = useLocation();

  // Show loading while auth or role is loading
  if (authLoading || (user && (requireAdmin || requireMediatore) && (!roleChecked || roleLoading))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Redirect non-admin users away from admin routes
  if (requireAdmin && roleChecked && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Redirect non-mediatore users away from mediatore routes
  if (requireMediatore && roleChecked && !isMediatore) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
