import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, Copy } from "lucide-react";
import { trackSimulationSave } from "@/utils/analytics";

const saveFormSchema = z.object({
  name: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  phone: z.string().min(10, "Inserisci un numero di telefono valido"),
  email: z.string().email("Inserisci un'email valida")
});

type SaveFormData = z.infer<typeof saveFormSchema>;

interface SaveSimulationDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: SaveFormData) => Promise<{ success: boolean; resumeCode?: string; error?: string }>;
  isLoading?: boolean;
}

export function SaveSimulationDialog({ open, onClose, onSave, isLoading = false }: SaveSimulationDialogProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [resumeCode, setResumeCode] = useState<string>('');
  
  const form = useForm<SaveFormData>({
    resolver: zodResolver(saveFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: ""
    }
  });

  const handleSubmit = async (data: SaveFormData) => {
    try {
      const result = await onSave(data);
      
      if (result.success && result.resumeCode) {
        // Track successful simulation save
        trackSimulationSave();
        
        setResumeCode(result.resumeCode);
        setStep('success');
        toast.success("Simulazione salvata con successo!");
      } else {
        toast.error(result.error || "Errore nel salvataggio della simulazione");
      }
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      toast.error("Si è verificato un errore imprevisto");
    }
  };

  const copyResumeCode = () => {
    navigator.clipboard.writeText(resumeCode);
    toast.success("Codice copiato negli appunti!");
  };

  const handleClose = () => {
    setStep('form');
    setResumeCode('');
    form.reset();
    onClose();
  };

  // Handle successful save and close - this will trigger navigation in parent
  const handleSuccessfulClose = () => {
    setStep('form');
    setResumeCode('');
    form.reset();
    onClose(); // This will now trigger navigation in the parent component
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {step === 'form' ? 'Salva la tua simulazione' : 'Simulazione salvata!'}
          </DialogTitle>
        </DialogHeader>

        {step === 'form' ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Inserisci i tuoi dati per salvare il progresso e riprendere la simulazione in seguito.
              </p>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome e Cognome</FormLabel>
                    <FormControl>
                      <Input placeholder="Mario Rossi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numero di telefono</FormLabel>
                    <FormControl>
                      <Input placeholder="+39 123 456 7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="mario@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Annulla
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-[#245C4F] hover:bg-[#1e4f44]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Salvataggio...' : 'Salva simulazione'}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                La tua simulazione è stata salvata! Usa questo codice per riprenderla:
              </p>
              
              <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                <code className="flex-1 text-lg font-mono font-bold text-center text-[#245C4F]">
                  {resumeCode}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyResumeCode}
                  className="p-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-xs text-gray-500">
                Conserva questo codice per riprendere la simulazione dal punto in cui l'hai lasciata.
              </p>
            </div>

            <Button 
              onClick={handleSuccessfulClose}
              className="w-full bg-[#245C4F] hover:bg-[#1e4f44] mt-6"
            >
              Chiudi
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
