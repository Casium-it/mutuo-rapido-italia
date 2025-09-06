-- Update app_role enum to add 'mediatore' and remove 'broker'
ALTER TYPE public.app_role RENAME TO app_role_old;

CREATE TYPE public.app_role AS ENUM ('admin', 'mediatore', 'user');

-- Update the user_roles table to use the new enum
ALTER TABLE public.user_roles ALTER COLUMN role TYPE public.app_role USING 
  CASE 
    WHEN role::text = 'broker' THEN 'mediatore'::public.app_role
    ELSE role::text::public.app_role
  END;

DROP TYPE public.app_role_old;