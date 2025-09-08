-- Fix search_path security warning for create_assignment_note function
ALTER FUNCTION public.create_assignment_note() SET search_path = public;