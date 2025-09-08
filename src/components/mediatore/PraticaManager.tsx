import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditableField } from '@/components/admin/EditableField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Euro, Calendar, TrendingUp, Home, User, Building } from 'lucide-react';

interface Pratica {
  id: string;
  submission_id: string;
  mediatore_id: string;
  importo_richiesto?: number;
  durata_anni?: number;
  tasso_interesse_atteso?: number;
  tipo_tasso?: 'fisso' | 'variabile' | 'misto';
  anticipo?: number;
  valore_immobile?: number;
  tipo_immobile?: string;
  destinazione_uso?: string;
  reddito_mensile_netto?: number;
  spese_mensili?: number;
  altri_finanziamenti?: number;
  banca_preferita?: string;
  consulente_banca?: string;
  data_richiesta?: string;
  data_prevista_erogazione?: string;
  status: string;
  priorita: number;
  note_interne?: string;
  created_at: string;
  updated_at: string;
}

interface PraticaManagerProps {
  submissionId: string;
}

const statusOptions = [
  { value: 'lead', label: 'Lead', color: 'bg-gray-100 text-gray-700' },
  { value: 'consulenza_programmata', label: 'Consulenza Programmata', color: 'bg-blue-100 text-blue-700' },
  { value: 'consulenza_saltata', label: 'Consulenza Saltata', color: 'bg-red-100 text-red-700' },
  { value: 'consulenza_completata', label: 'Consulenza Completata', color: 'bg-green-100 text-green-700' },
  { value: 'in_attesa_documenti', label: 'In Attesa di Documenti', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'documenti_ricevuti', label: 'Documenti Ricevuti', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'in_attesa_mandato', label: 'In Attesa di Mandato', color: 'bg-orange-100 text-orange-700' },
  { value: 'mandato_firmato', label: 'Mandato Firmato', color: 'bg-purple-100 text-purple-700' },
  { value: 'inviata_alla_banca', label: 'Inviata alla Banca', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'predelibera_ricevuta', label: 'Predelibera Ricevuta', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'istruttoria_ricevuta', label: 'Istruttoria Ricevuta', color: 'bg-teal-100 text-teal-700' },
  { value: 'rogito_completato', label: 'Rogito Completato', color: 'bg-green-100 text-green-700' },
  { value: 'pratica_rifiutata', label: 'Pratica Rifiutata', color: 'bg-red-100 text-red-700' },
  { value: 'pratica_sospesa', label: 'Pratica Sospesa', color: 'bg-orange-100 text-orange-700' },
  { value: 'non_risponde', label: 'Non Risponde', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'persa', label: 'Persa', color: 'bg-red-100 text-red-700' }
];

const priorityOptions = [
  { value: 1, label: 'Bassa' },
  { value: 2, label: 'Normale' },
  { value: 3, label: 'Media' },
  { value: 4, label: 'Alta' },
  { value: 5, label: 'Urgente' }
];

export function PraticaManager({ submissionId }: PraticaManagerProps) {
  const [pratica, setPratica] = useState<Pratica | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPratica();
  }, [submissionId]);

  const fetchPratica = async () => {
    try {
      const { data, error } = await supabase
        .from('pratiche')
        .select('*')
        .eq('submission_id', submissionId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setPratica(data);
    } catch (error) {
      console.error('Error fetching pratica:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = async (field: keyof Pratica, value: any) => {
    if (!pratica) return;

    try {
      const { error } = await supabase
        .from('pratiche')
        .update({ [field]: value })
        .eq('id', pratica.id);

      if (error) throw error;

      setPratica(prev => prev ? { ...prev, [field]: value } : prev);
      toast({
        title: "Campo aggiornato",
        description: "Le modifiche sono state salvate con successo.",
      });
    } catch (error) {
      console.error('Error updating pratica:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore durante l'aggiornamento del campo.",
      });
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '';
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value?: number) => {
    if (!value) return '';
    return `${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const createPratica = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('pratiche')
        .insert({
          submission_id: submissionId,
          mediatore_id: user.user.id,
          status: 'lead',
          priorita: 2
        })
        .select()
        .single();

      if (error) throw error;

      setPratica(data);
      toast({
        title: "Pratica creata",
        description: "Nuova pratica creata con successo.",
      });
    } catch (error) {
      console.error('Error creating pratica:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore durante la creazione della pratica.",
      });
    }
  };

  if (!pratica) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <p className="text-gray-500">Nessuna pratica trovata per questo lead.</p>
          <button
            onClick={createPratica}
            className="bg-[#245C4F] hover:bg-[#1e4f44] text-white px-6 py-2 rounded-lg transition-colors"
          >
            Crea Nuova Pratica
          </button>
        </CardContent>
      </Card>
    );
  }

  const currentStatus = statusOptions.find(s => s.value === pratica.status);

  return (
    <div className="space-y-6">
      {/* Status e Priorità */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Status e Priorità
            </CardTitle>
            <Badge className={currentStatus?.color}>
              {currentStatus?.label || pratica.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Status Pratica</label>
              <Select
                value={pratica.status}
                onValueChange={(value) => updateField('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Priorità</label>
              <Select
                value={pratica.priorita.toString()}
                onValueChange={(value) => updateField('priorita', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dettagli Mutuo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Dettagli Mutuo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField
              label="Importo Richiesto"
              value={formatCurrency(pratica.importo_richiesto)}
              rawValue={pratica.importo_richiesto?.toString() || ''}
              onSave={async (value) => {
                const cleanValue = value.replace(/[^\d,.-]/g, '').replace(',', '.').trim();
                const numValue = cleanValue === '' ? null : parseFloat(cleanValue);
                if (cleanValue === '' || !isNaN(numValue)) {
                  await updateField('importo_richiesto', numValue);
                }
              }}
              placeholder="€ 0"
            />
            <EditableField
              label="Durata (anni)"
              value={pratica.durata_anni?.toString() || ''}
              rawValue={pratica.durata_anni?.toString() || ''}
              onSave={async (value) => {
                const cleanValue = value.trim();
                const numValue = cleanValue === '' ? null : parseInt(cleanValue);
                if (cleanValue === '' || !isNaN(numValue)) {
                  await updateField('durata_anni', numValue);
                }
              }}
              placeholder="30"
            />
            <EditableField
              label="Tasso Interesse Atteso"
              value={formatPercentage(pratica.tasso_interesse_atteso)}
              rawValue={pratica.tasso_interesse_atteso ? (pratica.tasso_interesse_atteso * 100).toString() : ''}
              onSave={async (value) => {
                const cleanValue = value.replace('%', '').replace(',', '.').trim();
                const numValue = cleanValue === '' ? null : parseFloat(cleanValue);
                if (cleanValue === '' || !isNaN(numValue)) {
                  await updateField('tasso_interesse_atteso', numValue ? numValue / 100 : null);
                }
              }}
              placeholder="2.50%"
              isPercentage
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Tipo Tasso</label>
              <Select
                value={pratica.tipo_tasso || 'fisso'}
                onValueChange={(value) => updateField('tipo_tasso', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fisso">Fisso</SelectItem>
                  <SelectItem value="variabile">Variabile</SelectItem>
                  <SelectItem value="misto">Misto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <EditableField
              label="Anticipo"
              value={formatCurrency(pratica.anticipo)}
              rawValue={pratica.anticipo?.toString() || ''}
              onSave={async (value) => {
                const cleanValue = value.replace(/[^\d,.-]/g, '').replace(',', '.').trim();
                const numValue = cleanValue === '' ? null : parseFloat(cleanValue);
                if (cleanValue === '' || !isNaN(numValue)) {
                  await updateField('anticipo', numValue);
                }
              }}
              placeholder="€ 0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dettagli Immobile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Dettagli Immobile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField
              label="Valore Immobile"
              value={formatCurrency(pratica.valore_immobile)}
              rawValue={pratica.valore_immobile?.toString() || ''}
              onSave={async (value) => {
                const cleanValue = value.replace(/[^\d,.-]/g, '').replace(',', '.').trim();
                const numValue = cleanValue === '' ? null : parseFloat(cleanValue);
                if (cleanValue === '' || !isNaN(numValue)) {
                  await updateField('valore_immobile', numValue);
                }
              }}
              placeholder="€ 0"
            />
            <EditableField
              label="Tipo Immobile"
              value={pratica.tipo_immobile || ''}
              onSave={async (value) => await updateField('tipo_immobile', value)}
              placeholder="Appartamento, Villa, ecc."
            />
            <EditableField
              label="Destinazione d'Uso"
              value={pratica.destinazione_uso || ''}
              onSave={async (value) => await updateField('destinazione_uso', value)}
              placeholder="Prima casa, Seconda casa, Investimento"
            />
          </div>
        </CardContent>
      </Card>

      {/* Situazione Finanziaria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Situazione Finanziaria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField
              label="Reddito Mensile Netto"
              value={formatCurrency(pratica.reddito_mensile_netto)}
              rawValue={pratica.reddito_mensile_netto?.toString() || ''}
              onSave={async (value) => {
                const cleanValue = value.replace(/[^\d,.-]/g, '').replace(',', '.').trim();
                const numValue = cleanValue === '' ? null : parseFloat(cleanValue);
                if (cleanValue === '' || !isNaN(numValue)) {
                  await updateField('reddito_mensile_netto', numValue);
                }
              }}
              placeholder="€ 0"
            />
            <EditableField
              label="Spese Mensili"
              value={formatCurrency(pratica.spese_mensili)}
              rawValue={pratica.spese_mensili?.toString() || ''}
              onSave={async (value) => {
                const cleanValue = value.replace(/[^\d,.-]/g, '').replace(',', '.').trim();
                const numValue = cleanValue === '' ? null : parseFloat(cleanValue);
                if (cleanValue === '' || !isNaN(numValue)) {
                  await updateField('spese_mensili', numValue);
                }
              }}
              placeholder="€ 0"
            />
            <EditableField
              label="Altri Finanziamenti"
              value={formatCurrency(pratica.altri_finanziamenti)}
              rawValue={pratica.altri_finanziamenti?.toString() || ''}
              onSave={async (value) => {
                const cleanValue = value.replace(/[^\d,.-]/g, '').replace(',', '.').trim();
                const numValue = cleanValue === '' ? null : parseFloat(cleanValue);
                if (cleanValue === '' || !isNaN(numValue)) {
                  await updateField('altri_finanziamenti', numValue);
                }
              }}
              placeholder="€ 0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Banca e Tempistiche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Banca e Tempistiche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField
              label="Banca Preferita"
              value={pratica.banca_preferita || ''}
              onSave={async (value) => await updateField('banca_preferita', value)}
              placeholder="Nome banca"
            />
            <EditableField
              label="Consulente Banca"
              value={pratica.consulente_banca || ''}
              onSave={async (value) => await updateField('consulente_banca', value)}
              placeholder="Nome consulente"
            />
            <EditableField
              label="Data Richiesta"
              value={pratica.data_richiesta ? new Date(pratica.data_richiesta).toLocaleDateString('it-IT') : ''}
              rawValue={pratica.data_richiesta || ''}
              onSave={async (value) => await updateField('data_richiesta', value)}
              placeholder="Seleziona data richiesta"
              isDatePicker
            />
            <EditableField
              label="Data Prevista Erogazione"
              value={pratica.data_prevista_erogazione ? new Date(pratica.data_prevista_erogazione).toLocaleDateString('it-IT') : ''}
              rawValue={pratica.data_prevista_erogazione || ''}
              onSave={async (value) => await updateField('data_prevista_erogazione', value)}
              placeholder="Seleziona data prevista erogazione"
              isDatePicker
            />
          </div>
        </CardContent>
      </Card>

      {/* Note Interne */}
      <Card>
        <CardHeader>
          <CardTitle>Note Interne</CardTitle>
        </CardHeader>
        <CardContent>
          <EditableField
            label="Note"
            value={pratica.note_interne || ''}
            onSave={async (value) => await updateField('note_interne', value)}
            placeholder="Aggiungi note interne sulla pratica..."
            multiline
          />
        </CardContent>
      </Card>
    </div>
  );
}