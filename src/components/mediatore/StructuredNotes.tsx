import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit2, Trash2, FileText, Phone, Users, FileCheck, Building, User, AlertTriangle } from 'lucide-react';

interface Note {
  id: string;
  submission_id: string;
  mediatore_id: string;
  titolo: string;
  contenuto: string;
  tipo: 'generale' | 'telefonata' | 'incontro' | 'documentazione' | 'banca' | 'cliente' | 'urgente' | 'sistema';
  is_important: boolean;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

interface StructuredNotesProps {
  submissionId: string;
}

const noteTypes = [
  { value: 'generale', label: 'Generale', icon: FileText, color: 'bg-gray-100 text-gray-700' },
  { value: 'telefonata', label: 'Telefonata', icon: Phone, color: 'bg-blue-100 text-blue-700' },
  { value: 'incontro', label: 'Incontro', icon: Users, color: 'bg-green-100 text-green-700' },
  { value: 'documentazione', label: 'Documentazione', icon: FileCheck, color: 'bg-purple-100 text-purple-700' },
  { value: 'banca', label: 'Banca', icon: Building, color: 'bg-indigo-100 text-indigo-700' },
  { value: 'cliente', label: 'Cliente', icon: User, color: 'bg-yellow-100 text-yellow-700' },
  { value: 'urgente', label: 'Urgente', icon: AlertTriangle, color: 'bg-red-100 text-red-700' }
];

export function StructuredNotes({ submissionId }: StructuredNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({
    titolo: '',
    contenuto: '',
    tipo: 'generale' as Note['tipo'],
    is_important: false,
    is_private: false
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchNotes();
  }, [submissionId]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.titolo.trim() || !newNote.contenuto.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('lead_notes')
        .insert({
          submission_id: submissionId,
          mediatore_id: user.id,
          titolo: newNote.titolo.trim(),
          contenuto: newNote.contenuto.trim(),
          tipo: newNote.tipo,
          is_important: newNote.is_important,
          is_private: newNote.is_private
        })
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => [data, ...prev]);
      setNewNote({
        titolo: '',
        contenuto: '',
        tipo: 'generale',
        is_important: false,
        is_private: false
      });
      setIsAddingNote(false);
      
      toast({
        title: "Nota aggiunta",
        description: "La nota è stata salvata con successo.",
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore durante il salvataggio della nota.",
      });
    }
  };

  const handleEditNote = async () => {
    if (!editingNote || !editingNote.titolo.trim() || !editingNote.contenuto.trim()) return;

    try {
      const { data, error } = await supabase
        .from('lead_notes')
        .update({
          titolo: editingNote.titolo.trim(),
          contenuto: editingNote.contenuto.trim(),
          tipo: editingNote.tipo,
          is_important: editingNote.is_important,
          is_private: editingNote.is_private
        })
        .eq('id', editingNote.id)
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => prev.map(note => note.id === editingNote.id ? data : note));
      setEditingNote(null);
      
      toast({
        title: "Nota aggiornata",
        description: "Le modifiche sono state salvate con successo.",
      });
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore durante l'aggiornamento della nota.",
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa nota?')) return;

    try {
      const { error } = await supabase
        .from('lead_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== noteId));
      
      toast({
        title: "Nota eliminata",
        description: "La nota è stata eliminata con successo.",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore durante l'eliminazione della nota.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNoteTypeInfo = (tipo: string) => {
    return noteTypes.find(t => t.value === tipo) || noteTypes[0];
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Note ({notes.length})
          </CardTitle>
          <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#245C4F] hover:bg-[#1a453b]">
                <Plus className="h-4 w-4 mr-1" />
                Aggiungi Nota
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Aggiungi Nuova Nota</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Titolo</label>
                    <Input
                      value={newNote.titolo}
                      onChange={(e) => setNewNote(prev => ({ ...prev, titolo: e.target.value }))}
                      placeholder="Titolo della nota..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <Select
                      value={newNote.tipo}
                      onValueChange={(value: Note['tipo']) => setNewNote(prev => ({ ...prev, tipo: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {noteTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contenuto</label>
                  <Textarea
                    value={newNote.contenuto}
                    onChange={(e) => setNewNote(prev => ({ ...prev, contenuto: e.target.value }))}
                    placeholder="Scrivi qui il contenuto della nota..."
                    rows={6}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="important"
                      checked={newNote.is_important}
                      onCheckedChange={(checked) => setNewNote(prev => ({ ...prev, is_important: checked }))}
                    />
                    <label htmlFor="important" className="text-sm font-medium">
                      Importante
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="private"
                      checked={newNote.is_private}
                      onCheckedChange={(checked) => setNewNote(prev => ({ ...prev, is_private: checked }))}
                    />
                    <label htmlFor="private" className="text-sm font-medium">
                      Privata
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                    Annulla
                  </Button>
                  <Button 
                    onClick={handleAddNote}
                    disabled={!newNote.titolo.trim() || !newNote.contenuto.trim()}
                    className="bg-[#245C4F] hover:bg-[#1a453b]"
                  >
                    Salva Nota
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Nessuna nota presente</p>
            <p className="text-sm text-gray-400">Aggiungi la prima nota per questo lead</p>
          </div>
        ) : (
          notes.map((note) => {
            const typeInfo = getNoteTypeInfo(note.tipo);
            const IconComponent = typeInfo.icon;
            
            return (
              <div
                key={note.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <IconComponent className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 flex-1">{note.titolo}</h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {note.is_important && (
                        <Badge variant="destructive" className="text-xs">
                          Importante
                        </Badge>
                      )}
                      {note.is_private && (
                        <Badge variant="secondary" className="text-xs">
                          Privata
                        </Badge>
                      )}
                      <Badge className={`text-xs ${typeInfo.color}`}>
                        {typeInfo.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Dialog open={editingNote?.id === note.id} onOpenChange={(open) => !open && setEditingNote(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setEditingNote(note)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Modifica Nota</DialogTitle>
                        </DialogHeader>
                        {editingNote && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Titolo</label>
                                <Input
                                  value={editingNote.titolo}
                                  onChange={(e) => setEditingNote(prev => prev ? ({ ...prev, titolo: e.target.value }) : null)}
                                  placeholder="Titolo della nota..."
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Tipo</label>
                                <Select
                                  value={editingNote.tipo}
                                  onValueChange={(value: Note['tipo']) => setEditingNote(prev => prev ? ({ ...prev, tipo: value }) : null)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {noteTypes.map((type) => (
                                      <SelectItem key={type.value} value={type.value}>
                                        <div className="flex items-center gap-2">
                                          <type.icon className="h-4 w-4" />
                                          {type.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Contenuto</label>
                              <Textarea
                                value={editingNote.contenuto}
                                onChange={(e) => setEditingNote(prev => prev ? ({ ...prev, contenuto: e.target.value }) : null)}
                                placeholder="Scrivi qui il contenuto della nota..."
                                rows={6}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="edit-important"
                                  checked={editingNote.is_important}
                                  onCheckedChange={(checked) => setEditingNote(prev => prev ? ({ ...prev, is_important: checked }) : null)}
                                />
                                <label htmlFor="edit-important" className="text-sm font-medium">
                                  Importante
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="edit-private"
                                  checked={editingNote.is_private}
                                  onCheckedChange={(checked) => setEditingNote(prev => prev ? ({ ...prev, is_private: checked }) : null)}
                                />
                                <label htmlFor="edit-private" className="text-sm font-medium">
                                  Privata
                                </label>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setEditingNote(null)}>
                                Annulla
                              </Button>
                              <Button 
                                onClick={handleEditNote}
                                disabled={!editingNote.titolo.trim() || !editingNote.contenuto.trim()}
                                className="bg-[#245C4F] hover:bg-[#1a453b]"
                              >
                                Salva Modifiche
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteNote(note.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2 whitespace-pre-wrap">{note.contenuto}</p>
                <p className="text-xs text-gray-400">
                  {formatDate(note.created_at)}
                  {note.updated_at !== note.created_at && ' (modificata)'}
                </p>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}