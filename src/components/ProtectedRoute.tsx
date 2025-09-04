
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (user && requireAdmin) {
      setRoleLoading(true);
      const checkRole = async () => {
        try {
          const { data: roleData } = await supabase.rpc('get_current_user_role');
          setIsAdmin(roleData === 'admin');
        } catch (error) {
          console.error('Error checking user role:', error);
          setIsAdmin(false);
        } finally {
          setRoleLoading(false);
        }
      };
      checkRole();
    } else if (!requireAdmin) {
      setIsAdmin(null); // Not needed for non-admin routes
      setRoleLoading(false);
    }
  }, [user, requireAdmin]);

  if (loading || (requireAdmin && roleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireAdmin && isAdmin === false) {
    // Redirect non-admin users to home instead of showing access denied
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
