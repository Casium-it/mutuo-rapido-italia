
-- Create admin notification settings table
CREATE TABLE public.admin_notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_name text NOT NULL,
  phone_number text NOT NULL,
  notifications_enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent duplicate entries
ALTER TABLE public.admin_notification_settings ADD CONSTRAINT unique_admin_phone UNIQUE (phone_number);

-- Insert default settings for Leonardo and Filippo
INSERT INTO public.admin_notification_settings (admin_name, phone_number, notifications_enabled) 
VALUES 
  ('Leonardo', '+393661337363', true),
  ('Filippo', '+393519440664', true);

-- Enable RLS
ALTER TABLE public.admin_notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Only admins can manage notification settings" 
  ON public.admin_notification_settings 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
