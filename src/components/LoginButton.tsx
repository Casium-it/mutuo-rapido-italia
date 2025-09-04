
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function LoginButton() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const checkRole = async () => {
        try {
          const { data: roleData } = await supabase.rpc('get_current_user_role');
          setIsAdmin(roleData === 'admin');
        } catch (error) {
          setIsAdmin(false);
        } finally {
          setLoading(false);
        }
      };
      checkRole();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {isAdmin && !loading && (
          <Button
            onClick={() => navigate('/admin')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Admin
          </Button>
        )}
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Esci
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => navigate('/auth')}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <User className="h-4 w-4" />
      Login
    </Button>
  );
}
