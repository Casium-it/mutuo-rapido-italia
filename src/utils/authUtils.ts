import { supabase } from '@/integrations/supabase/client';

export const checkUserRole = async (): Promise<string | null> => {
  try {
    const { data: roleData } = await supabase.rpc('get_current_user_role');
    return roleData || null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
};

export const isUserAdmin = async (): Promise<boolean> => {
  const role = await checkUserRole();
  return role === 'admin';
};