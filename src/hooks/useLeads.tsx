import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LeadStatus } from '@/types/leadStatus';

export interface Lead {
  id: string;
  form_submission_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  lead_status: LeadStatus;
  notes: string | null;
  mediatore: string | null;
  source: string | null;
  priority: number | null;
  next_contact_date: string | null;
  last_contact_date: string | null;
  created_at: string;
  updated_at: string;
  // Joined data from form_submissions
  form_submissions?: {
    consulting: boolean | null;
    user_identifier: string | null;
    metadata: any;
    created_at: string;
    forms?: {
      title: string;
      slug: string;
    };
  };
}

export interface LeadFilters {
  status: string;
  phone: 'all' | 'with' | 'without';
  form: string;
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<Array<{ slug: string; title: string }>>([]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      
      // Fetch leads with form submission data
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select(`
          *,
          form_submissions (
            consulting,
            user_identifier,
            metadata,
            created_at,
            forms (
              title,
              slug
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        toast({
          title: "Errore",
          description: "Errore nel caricamento dei leads",
          variant: "destructive"
        });
        return;
      }

      setLeads(leadsData || []);

      // Extract unique forms for filtering
      const uniqueForms = Array.from(
        new Map(
          (leadsData || [])
            .filter(lead => lead.form_submissions?.forms)
            .map(lead => [
              lead.form_submissions!.forms!.slug,
              {
                slug: lead.form_submissions!.forms!.slug,
                title: lead.form_submissions!.forms!.title
              }
            ])
        ).values()
      );
      
      setForms(uniqueForms);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore",
        description: "Errore imprevisto",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLead = async (leadId: string, field: string, value: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ [field]: value })
        .eq('id', leadId);

      if (error) {
        console.error('Error updating lead:', error);
        toast({
          title: "Errore",
          description: "Errore nell'aggiornamento del lead",
          variant: "destructive"
        });
        return false;
      }

      // Update local state
      setLeads(prev => 
        prev.map(lead => 
          lead.id === leadId 
            ? { ...lead, [field]: value }
            : lead
        )
      );
      
      toast({
        title: "Successo",
        description: "Lead aggiornato con successo",
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Errore",
        description: "Errore imprevisto nell'aggiornamento",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteLead = async (leadId: string) => {
    try {
      // First delete related interactions
      const { error: interactionsError } = await supabase
        .from('lead_interactions')
        .delete()
        .eq('lead_id', leadId);

      if (interactionsError) {
        console.error('Error deleting lead interactions:', interactionsError);
        throw interactionsError;
      }

      // Then delete the lead
      const { error: leadError } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (leadError) {
        console.error('Error deleting lead:', leadError);
        throw leadError;
      }

      // Update local state
      setLeads(prev => prev.filter(lead => lead.id !== leadId));
      
      toast({
        title: "Successo",
        description: "Lead eliminato con successo",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: "Errore",
        description: `Errore nell'eliminazione del lead: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };

  const filterLeads = (leads: Lead[], filters: LeadFilters) => {
    return leads.filter(lead => {
      const statusMatch = filters.status === 'all' || lead.lead_status === filters.status;
      const phoneMatch = filters.phone === 'all' || 
        (filters.phone === 'with' && lead.phone_number) ||
        (filters.phone === 'without' && !lead.phone_number);
      const formMatch = filters.form === 'all' || lead.form_submissions?.forms?.slug === filters.form;
      return statusMatch && phoneMatch && formMatch;
    });
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return {
    leads,
    loading,
    forms,
    fetchLeads,
    updateLead,
    deleteLead,
    filterLeads
  };
}