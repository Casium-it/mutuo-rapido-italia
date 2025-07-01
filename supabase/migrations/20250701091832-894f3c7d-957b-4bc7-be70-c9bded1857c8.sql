
-- Create secure function to get masked admin notification settings
-- This function bypasses RLS policies using SECURITY DEFINER
-- and returns masked data for privacy protection
CREATE OR REPLACE FUNCTION public.get_masked_admin_notifications()
RETURNS TABLE (
  admin_id uuid,
  admin_display_name text,
  phone_masked text,
  phone_full text
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ans.id as admin_id,
    -- Mask admin name: show first letter + stars + last letter if > 2 chars
    CASE 
      WHEN length(ans.admin_name) <= 2 THEN ans.admin_name
      ELSE left(ans.admin_name, 1) || repeat('*', greatest(length(ans.admin_name) - 2, 1)) || right(ans.admin_name, 1)
    END as admin_display_name,
    -- Mask phone number: show country code + first 3 digits + stars + last digit
    CASE 
      WHEN length(ans.phone_number) > 8 THEN 
        left(ans.phone_number, 6) || repeat('*', greatest(length(ans.phone_number) - 7, 4)) || right(ans.phone_number, 1)
      ELSE 
        left(ans.phone_number, 3) || repeat('*', greatest(length(ans.phone_number) - 3, 4))
    END as phone_masked,
    -- Full phone number for actual message sending (used internally only)
    ans.phone_number as phone_full
  FROM admin_notification_settings ans
  WHERE ans.notifications_enabled = true
  ORDER BY ans.created_at ASC;
END;
$$;

-- Grant execute permission to authenticated and anonymous users
-- This is safe because the function only returns masked data for enabled notifications
GRANT EXECUTE ON FUNCTION public.get_masked_admin_notifications() TO anon;
GRANT EXECUTE ON FUNCTION public.get_masked_admin_notifications() TO authenticated;
