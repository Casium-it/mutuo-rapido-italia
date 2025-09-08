-- Fix function search_path security warnings
ALTER FUNCTION public.create_pratica_on_assignment() SET search_path = public;
ALTER FUNCTION public.log_pratica_updates() SET search_path = public;  
ALTER FUNCTION public.log_note_activities() SET search_path = public;
ALTER FUNCTION public.get_lead_timeline(UUID) SET search_path = public;