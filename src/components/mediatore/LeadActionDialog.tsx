import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { StickyNote, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LeadStatus } from '@/types/leadStatus';

type PraticaStatus = 'lead' | 'consulenza_programmata' | 'consulenza_saltata' | 'consulenza_completata' | 'in_attesa_documenti' | 'documenti_ricevuti' | 
  'in_attesa_mandato' | 'mandato_firmato' | 'inviata_alla_banca' | 'predelibera_ricevuta' | 'istruttoria_ricevuta' | 
  'rogito_completato' | 'pratica_rifiutata' | 'pratica_sospesa' | 'non_risponde' | 'persa';

interface LeadActionDialogProps {
  children: React.ReactNode;
  submissionId: string;
  currentLeadStatus: LeadStatus;
  currentPraticaStatus?: PraticaStatus;
  onUpdate: () => void;
}

const praticaStatusOptions = [
  { value: 'lead', label: 'Lead' },
  { value: 'consulenza_programmata', label: 'Consulenza Programmata' },
  { value: 'consulenza_saltata', label: 'Consulenza Saltata' },
  { value: 'consulenza_completata', label: 'Consulenza Completata' },
  { value: 'in_attesa_documenti', label: 'In Attesa Documenti' },
  { value: 'documenti_ricevuti', label: 'Documenti Ricevuti' },
  { value: 'in_attesa_mandato', label: 'In Attesa Mandato' },
  { value: 'mandato_firmato', label: 'Mandato Firmato' },
  { value: 'inviata_alla_banca', label: 'Inviata alla Banca' },
  { value: 'predelibera_ricevuta', label: 'Predelibera Ricevuta' },
  { value: 'istruttoria_ricevuta', label: 'Istruttoria Ricevuta' },
  { value: 'rogito_completato', label: 'Rogito Completato' },
  { value: 'pratica_rifiutata', label: 'Pratica Rifiutata' },
  { value: 'pratica_sospesa', label: 'Pratica Sospesa' },
  { value: 'non_risponde', label: 'Non Risponde' },
  { value: 'persa', label: 'Persa' }
];

const leadStatusOptions = [
  { value: 'not_contacted', label: 'Non Contattato' },
  { value: 'non_risponde_x1', label: 'Non Risponde x1' },
  { value: 'non_risponde_x2', label: 'Non Risponde x2' },
  { value: 'non_risponde_x3', label: 'Non Risponde x3' },
  { value: 'non_interessato', label: 'Non Interessato' },
  { value: 'da_risentire', label: 'Da Risentire' },
  { value: 'da_assegnare', label: 'Da Assegnare' },
  { value: 'prenotata_consulenza', label: 'Prenotata Consulenza' },
  { value: 'pratica_bocciata', label: 'Pratica Bocciata' },
  { value: 'converted', label: 'Convertito' },
  { value: 'perso', label: 'Perso' }
];

const noteTypes = [
  { value: 'generale', label: 'Generale' },
  { value: 'telefonata', label: 'Telefonata' },
  { value: 'incontro', label: 'Incontro' },
  { value: 'documentazione', label: 'Documentazione' },
  { value: 'banca', label: 'Banca' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'urgente', label: 'Urgente' }
];

export function LeadActionDialog({ 
  children, 
  submissionId, 
  currentLeadStatus, 
  currentPraticaStatus,
  onUpdate 
}: LeadActionDialogProps) {
  const [open, setOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<string>('generale');
  const [selectedLeadStatus, setSelectedLeadStatus] = useState<string>(currentLeadStatus);
  const [selectedPraticaStatus, setSelectedPraticaStatus] = useState<string>(currentPraticaStatus || 'lead');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Save note if provided
      if (noteTitle.trim() || noteContent.trim()) {
        const { error: noteError } = await supabase
          .from('lead_notes')
          .insert({
            submission_id: submissionId,
            mediatore_id: user.user.id,
            titolo: noteTitle.trim() || 'Nota rapida',
            contenuto: noteContent.trim() || 'Nota aggiunta dal badge lead',
            tipo: noteType as any,
            is_private: isPrivate
          });

        if (noteError) throw noteError;
      }

      // Update lead status if changed
      if (selectedLeadStatus !== currentLeadStatus) {
        const { error: leadError } = await supabase
          .from('form_submissions')
          .update({ lead_status: selectedLeadStatus as LeadStatus })
          .eq('id', submissionId);

        if (leadError) throw leadError;
      }

      // Update pratica status if changed
      if (selectedPraticaStatus !== currentPraticaStatus) {
        // First check if pratica exists
        const { data: existingPratica } = await supabase
          .from('pratiche')
          .select('id')
          .eq('submission_id', submissionId)
          .maybeSingle();

        if (existingPratica) {
          // Update existing pratica
          const { error: praticaError } = await supabase
            .from('pratiche')
            .update({ status: selectedPraticaStatus as any })
            .eq('submission_id', submissionId);

          if (praticaError) throw praticaError;
        } else {
          // Create new pratica
          const { error: praticaError } = await supabase
            .from('pratiche')
            .insert({
              submission_id: submissionId,
              mediatore_id: user.user.id,
              status: selectedPraticaStatus as any
            });

          if (praticaError) throw praticaError;
        }
      }

      toast({
        title: "Successo",
        description: "Aggiornamenti salvati con successo.",
      });

      // Reset form
      setNoteTitle('');
      setNoteContent('');
      setNoteType('generale');
      setIsPrivate(false);
      setOpen(false);
      onUpdate();

    } catch (error) {
      console.error('Error saving updates:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore durante il salvataggio degli aggiornamenti.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-[#245C4F]" />
            Gestione Lead e Note
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Status Management */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">Gestione Status</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status Lead</Label>
                <Select value={selectedLeadStatus} onValueChange={setSelectedLeadStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {leadStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Status Pratica</Label>
                <Select value={selectedPraticaStatus} onValueChange={setSelectedPraticaStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {praticaStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Note Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">Aggiungi Nota (Opzionale)</h4>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="note-title">Titolo Nota</Label>
                  <input
                    id="note-title"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Titolo della nota..."
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#245C4F]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Tipo Nota</Label>
                  <Select value={noteType} onValueChange={setNoteType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {noteTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="note-content">Contenuto Nota</Label>
                <Textarea
                  id="note-content"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Scrivi qui il contenuto della nota..."
                  className="min-h-[120px] resize-none"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="private-note"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="private-note" className="text-sm">
                  Nota privata (visibile solo a te)
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Annulla
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-[#245C4F] hover:bg-[#1e4f44]"
          >
            {loading ? 'Salvataggio...' : 'Salva'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}