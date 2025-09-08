-- Fix search_path security warnings for all functions
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;
ALTER FUNCTION public.get_current_user_role() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.generate_slug(text) SET search_path = public;
ALTER FUNCTION public.calculate_reading_time(text) SET search_path = public;
ALTER FUNCTION public.update_blog_article_edited_by() SET search_path = public;
ALTER FUNCTION public.is_question_used(text) SET search_path = public;
ALTER FUNCTION public.generate_resume_code() SET search_path = public;
ALTER FUNCTION public.get_masked_admin_notifications() SET search_path = public;
ALTER FUNCTION public.reconstruct_form_state(uuid) SET search_path = public;
ALTER FUNCTION public.generate_simulation_id(timestamp with time zone) SET search_path = public;