-- Fix security warnings by setting proper search_path for functions

-- Update generate_slug function with proper search_path
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '[àáâäæ]', 'a', 'gi'),
        '[èéêë]', 'e', 'gi'
      ),
      '[^a-zA-Z0-9\s]', '', 'g'
    )
  );
END;
$$;

-- Update calculate_reading_time function with proper search_path
CREATE OR REPLACE FUNCTION public.calculate_reading_time(content TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Average reading speed: 200 words per minute
  RETURN GREATEST(1, CEIL(array_length(string_to_array(content, ' '), 1) / 200.0));
END;
$$;