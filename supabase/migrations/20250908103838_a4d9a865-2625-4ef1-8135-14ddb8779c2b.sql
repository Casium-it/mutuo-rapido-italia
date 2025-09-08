-- Add trigger to log pratiche updates
CREATE TRIGGER trigger_log_pratica_updates
  AFTER UPDATE ON public.pratiche
  FOR EACH ROW
  EXECUTE FUNCTION public.log_pratica_updates();

-- Add trigger to log document activities  
CREATE TRIGGER trigger_log_document_activities
  AFTER INSERT OR DELETE ON public.pratica_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.log_document_activities();