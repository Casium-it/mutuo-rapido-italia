-- Add RLS policies for admins on saved_simulations table
-- Allow admins to view all saved simulations
CREATE POLICY "Admins can view all saved simulations" 
ON public.saved_simulations 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete saved simulations (for management purposes)
CREATE POLICY "Admins can delete saved simulations" 
ON public.saved_simulations 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update saved simulations (for management purposes like notes)
CREATE POLICY "Admins can update saved simulations" 
ON public.saved_simulations 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));