import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, User, MapPin } from 'lucide-react';
import { LeadStatusBadge } from '@/components/admin/LeadStatusBadge';
import { LeadStatus } from '@/types/leadStatus';

interface Lead {
  id: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  lead_status: LeadStatus;
  provincia?: string | null;
  form_responses?: Array<{
    question_id: string;
    response_value: any;
  }>;
}

export default function MediatoreLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchLeads = async () => {
    try {
      setLoading(true);
      
      // Fetch all form submissions with responses
      const { data: submissions, error } = await supabase
        .from('form_submissions')
        .select(`
          id,
          created_at,
          first_name,
          last_name,
          lead_status,
          form_responses!inner(
            question_id,
            response_value
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
        return;
      }

      // Process leads to extract provincia from responses
      const processedLeads = submissions?.map(submission => {
        const provinciaResponse = submission.form_responses?.find(
          response => response.question_id.includes('provincia') || 
                     response.question_id.includes('citta') ||
                     response.question_id.includes('zona')
        );

        let provincia = null;
        if (provinciaResponse?.response_value) {
          if (typeof provinciaResponse.response_value === 'object' && 
              provinciaResponse.response_value !== null && 
              !Array.isArray(provinciaResponse.response_value) &&
              'default' in provinciaResponse.response_value) {
            provincia = provinciaResponse.response_value.default;
          } else if (typeof provinciaResponse.response_value === 'string') {
            provincia = provinciaResponse.response_value;
          }
        }

        return {
          ...submission,
          provincia
        };
      }) || [];

      setLeads(processedLeads);
    } catch (error) {
      console.error('Error in fetchLeads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento lead...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      {/* Header */}
      <header className="bg-white border-b border-[#BEB8AE] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/mediatore')}
              variant="ghost"
              className="flex items-center gap-2 text-gray-700 hover:text-[#00853E] hover:bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna alla Dashboard
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-2xl font-bold text-[#245C4F]">Gestione Lead</h1>
              <p className="text-gray-600">I tuoi lead assegnati</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {leads.length === 0 ? (
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun lead trovato</h3>
              <p className="text-gray-500">Al momento non ci sono lead assegnati.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Lead ({leads.length})
              </h2>
            </div>

            {/* Leads List */}
            <div className="grid gap-4">
              {leads.map((lead) => (
                <Card key={lead.id} className="bg-white border border-[#BEB8AE]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Name */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="font-medium text-gray-900 truncate">
                            {lead.first_name && lead.last_name 
                              ? `${lead.first_name} ${lead.last_name}`
                              : lead.first_name || lead.last_name || 'Nome non disponibile'
                            }
                          </span>
                        </div>

                        {/* Status */}
                        <div className="flex-shrink-0">
                          <LeadStatusBadge status={lead.lead_status} />
                        </div>

                        {/* Provincia */}
                        {lead.provincia && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 flex-shrink-0">
                            <MapPin className="h-4 w-4" />
                            <span>{lead.provincia}</span>
                          </div>
                        )}

                        {/* Date */}
                        <div className="flex items-center gap-1 text-sm text-gray-600 flex-shrink-0">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(lead.created_at)}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled
                        className="opacity-50 cursor-not-allowed"
                      >
                        Dettagli
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}