
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { User, LogOut } from 'lucide-react';

export function LoginButton() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin, isMediatore, roleLoading } = useUserRole();

  const handleSignOut = async () => {
    await signOut();
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {isAdmin && !roleLoading && (
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
        {isMediatore && !roleLoading && (
          <Button
            onClick={() => navigate('/mediatore')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Mediatore
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
