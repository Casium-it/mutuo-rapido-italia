import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useUserRole() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    if (user && !roleChecked) {
      setRoleLoading(true);
      const checkRole = async () => {
        try {
          const { data: roleData } = await supabase.rpc('get_current_user_role');
          setUserRole(roleData || null);
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole(null);
        } finally {
          setRoleLoading(false);
          setRoleChecked(true);
        }
      };
      checkRole();
    } else if (!user) {
      setUserRole(null);
      setRoleChecked(false);
      setRoleLoading(false);
    }
  }, [user, roleChecked]);

  const isAdmin = userRole === 'admin';
  const isMediatore = userRole === 'mediatore';

  return {
    userRole,
    isAdmin,
    isMediatore,
    roleLoading,
    roleChecked
  };
}