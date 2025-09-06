-- Create a function to get mediatori profiles
CREATE OR REPLACE FUNCTION public.get_mediatori_profiles()
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.first_name,
    p.last_name
  FROM profiles p
  INNER JOIN user_roles ur ON ur.user_id = p.id
  WHERE ur.role = 'mediatore'
  ORDER BY p.first_name, p.last_name;
$$;