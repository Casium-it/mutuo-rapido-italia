import { useState, useEffect } from "react";
import { Settings, Copy, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Block } from "@/types/form";
import { useToast } from "@/hooks/use-toast";

interface BlockEditDialogProps {
  block: Block;
  formId: string;
  formTitle: string;
  availableForms: Array<{ id: string; title: string; slug: string }>;
  onUpdate: (blockId: string, updatedBlock: Block, newFormId?: string) => Promise<void>;
  onDuplicate: (block: Block, targetFormId: string) => Promise<void>;
}

export function BlockEditDialog({
  block,
  formId,
  formTitle,
  availableForms,
  onUpdate,
  onDuplicate
}: BlockEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: block.title,
    block_id: block.block_id,
    block_number: block.block_number,
    priority: block.priority,
    default_active: block.default_active || false,
    invisible: block.invisible || false,
    multiBlock: block.multiBlock || false,
    blueprint_id: block.blueprint_id || "",
    copy_number: block.copy_number || 0,
    targetFormId: formId
  });

  const [duplicateFormId, setDuplicateFormId] = useState("");

  // Reset form when block changes
  useEffect(() => {
    setFormData({
      title: block.title,
      block_id: block.block_id,
      block_number: block.block_number,
      priority: block.priority,
      default_active: block.default_active || false,
      invisible: block.invisible || false,
      multiBlock: block.multiBlock || false,
      blueprint_id: block.blueprint_id || "",
      copy_number: block.copy_number || 0,
      targetFormId: formId
    });
  }, [block, formId]);

  const hasChanges = () => {
    return (
      formData.title !== block.title ||
      formData.block_id !== block.block_id ||
      formData.block_number !== block.block_number ||
      formData.priority !== block.priority ||
      formData.default_active !== (block.default_active || false) ||
      formData.invisible !== (block.invisible || false) ||
      formData.multiBlock !== (block.multiBlock || false) ||
      formData.blueprint_id !== (block.blueprint_id || "") ||
      formData.copy_number !== (block.copy_number || 0) ||
      formData.targetFormId !== formId
    );
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const updatedBlock: Block = {
        ...block,
        title: formData.title,
        block_id: formData.block_id,
        block_number: formData.block_number,
        priority: formData.priority,
        default_active: formData.default_active,
        invisible: formData.invisible,
        multiBlock: formData.multiBlock,
        blueprint_id: formData.blueprint_id || undefined,
        copy_number: formData.copy_number || undefined,
      };

      await onUpdate(
        block.block_id,
        updatedBlock,
        formData.targetFormId !== formId ? formData.targetFormId : undefined
      );

      toast({
        title: "Blocco aggiornato",
        description: "Le modifiche sono state salvate con successo",
      });

      setOpen(false);
      setConfirmationOpen(false);
    } catch (error) {
      console.error('Error updating block:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento del blocco",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    if (!duplicateFormId) {
      toast({
        title: "Errore",
        description: "Seleziona un form di destinazione",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onDuplicate(block, duplicateFormId);
      
      toast({
        title: "Blocco duplicato",
        description: "Il blocco è stato duplicato con successo",
      });

      setDuplicateOpen(false);
      setOpen(false);
    } catch (error) {
      console.error('Error duplicating block:', error);
      toast({
        title: "Errore",
        description: "Errore durante la duplicazione del blocco",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getChangeSummary = () => {
    const changes = [];
    if (formData.title !== block.title) changes.push(`Titolo: "${block.title}" → "${formData.title}"`);
    if (formData.block_id !== block.block_id) changes.push(`ID Blocco: "${block.block_id}" → "${formData.block_id}"`);
    if (formData.block_number !== block.block_number) changes.push(`Numero Blocco: "${block.block_number}" → "${formData.block_number}"`);
    if (formData.priority !== block.priority) changes.push(`Priorità: ${block.priority} → ${formData.priority}`);
    if (formData.default_active !== (block.default_active || false)) changes.push(`Default Active: ${block.default_active || false} → ${formData.default_active}`);
    if (formData.invisible !== (block.invisible || false)) changes.push(`Invisibile: ${block.invisible || false} → ${formData.invisible}`);
    if (formData.multiBlock !== (block.multiBlock || false)) changes.push(`Multi Block: ${block.multiBlock || false} → ${formData.multiBlock}`);
    if (formData.targetFormId !== formId) {
      const newForm = availableForms.find(f => f.id === formData.targetFormId);
      changes.push(`Form: "${formTitle}" → "${newForm?.title || formData.targetFormId}"`);
    }
    return changes;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifica Blocco</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informazioni Base</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Titolo</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="block_id">ID Blocco</Label>
                  <Input
                    id="block_id"
                    value={formData.block_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, block_id: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="block_number">Numero Blocco</Label>
                  <Input
                    id="block_number"
                    value={formData.block_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, block_number: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Priorità</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Form Association */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Associazione Form</h3>
              <div>
                <Label htmlFor="targetForm">Form di Destinazione</Label>
                <Select value={formData.targetFormId} onValueChange={(value) => setFormData(prev => ({ ...prev, targetFormId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona form..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableForms.map((form) => (
                      <SelectItem key={form.id} value={form.id}>
                        {form.title} ({form.slug})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Behavior Flags */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Comportamento</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="default_active"
                    checked={formData.default_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, default_active: !!checked }))}
                  />
                  <Label htmlFor="default_active">Default Active</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="invisible"
                    checked={formData.invisible}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, invisible: !!checked }))}
                  />
                  <Label htmlFor="invisible">Invisibile</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="multiBlock"
                    checked={formData.multiBlock}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, multiBlock: !!checked }))}
                  />
                  <Label htmlFor="multiBlock">Multi Block</Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Advanced Properties */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Proprietà Avanzate</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="blueprint_id">Blueprint ID</Label>
                  <Input
                    id="blueprint_id"
                    value={formData.blueprint_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, blueprint_id: e.target.value }))}
                    placeholder="Opzionale"
                  />
                </div>
                
                <div>
                  <Label htmlFor="copy_number">Numero Copia</Label>
                  <Input
                    id="copy_number"
                    type="number"
                    value={formData.copy_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, copy_number: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Block Info */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Informazioni Blocco</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {block.questions.length} domande
                </Badge>
                <Badge variant="outline">
                  Form attuale: {formTitle}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setDuplicateOpen(true)}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Duplica
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Annulla
                </Button>
                <Button
                  onClick={() => hasChanges() ? setConfirmationOpen(true) : setOpen(false)}
                  disabled={loading}
                >
                  {hasChanges() ? 'Salva Modifiche' : 'Chiudi'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Conferma Modifiche
            </AlertDialogTitle>
            <AlertDialogDescription>
              Stai per apportare le seguenti modifiche al blocco:
              <div className="mt-3 space-y-1">
                {getChangeSummary().map((change, index) => (
                  <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {change}
                  </div>
                ))}
              </div>
              <div className="mt-3 font-semibold">
                Sei sicuro di voler procedere?
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave} disabled={loading}>
              {loading ? 'Salvando...' : 'Conferma'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Dialog */}
      <AlertDialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplica Blocco</AlertDialogTitle>
            <AlertDialogDescription>
              Seleziona il form di destinazione per la duplicazione:
              <div className="mt-4">
                <Select value={duplicateFormId} onValueChange={setDuplicateFormId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona form di destinazione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableForms.map((form) => (
                      <SelectItem key={form.id} value={form.id}>
                        {form.title} ({form.slug})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDuplicateFormId("")}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDuplicate} disabled={loading || !duplicateFormId}>
              {loading ? 'Duplicando...' : 'Duplica'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}