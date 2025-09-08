import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { StickyNote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SimpleNoteDialogProps {
  children: React.ReactNode;
  submissionId: string;
  onUpdate: () => void;
}

const noteTypes = [
  { value: 'generale', label: 'Generale' },
  { value: 'telefonata', label: 'Telefonata' },
  { value: 'incontro', label: 'Incontro' },
  { value: 'documentazione', label: 'Documentazione' },
  { value: 'banca', label: 'Banca' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'urgente', label: 'Urgente' }
];

export function SimpleNoteDialog({ children, submissionId, onUpdate }: SimpleNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<string>('generale');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!noteTitle.trim() && !noteContent.trim()) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Inserisci almeno un titolo o contenuto per la nota.",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('lead_notes')
        .insert({
          submission_id: submissionId,
          mediatore_id: user.user.id,
          titolo: noteTitle.trim() || 'Nota rapida',
          contenuto: noteContent.trim() || 'Nota aggiunta dal mediatore',
          tipo: noteType as any,
          is_private: isPrivate
        });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Nota aggiunta con successo.",
      });

      // Reset form
      setNoteTitle('');
      setNoteContent('');
      setNoteType('generale');
      setIsPrivate(false);
      setOpen(false);
      onUpdate();

    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore durante il salvataggio della nota.",
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-[#245C4F]" />
            Aggiungi Nota
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
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
          
          <div className="space-y-2">
            <Label htmlFor="note-content">Contenuto Nota</Label>
            <Textarea
              id="note-content"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Scrivi qui il contenuto della nota..."
              className="min-h-[100px] resize-none"
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
            {loading ? 'Salvataggio...' : 'Salva Nota'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}