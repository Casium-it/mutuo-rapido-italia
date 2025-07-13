import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  title: z.string().min(1, 'Il titolo è obbligatorio'),
  description: z.string().optional(),
  slug: z.string().min(1, 'Lo slug è obbligatorio').regex(/^[a-z0-9-]+$/, 'Lo slug può contenere solo lettere minuscole, numeri e trattini'),
  form_type: z.string().min(1, 'Il tipo di form è obbligatorio'),
  completion_behavior: z.enum(['form-completed', 'form-completed-redirect']),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface FormEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: {
    id: string;
    title: string;
    description?: string;
    slug: string;
    form_type: string;
    completion_behavior: string;
    is_active: boolean;
  } | null;
  onFormUpdated: () => void;
}

export function FormEditDialog({ open, onOpenChange, form, onFormUpdated }: FormEditDialogProps) {
  const { toast } = useToast();
  
  const formMethods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      slug: '',
      form_type: 'general',
      completion_behavior: 'form-completed',
      is_active: true,
    },
  });

  React.useEffect(() => {
    if (form) {
      formMethods.reset({
        title: form.title,
        description: form.description || '',
        slug: form.slug,
        form_type: form.form_type,
        completion_behavior: form.completion_behavior as 'form-completed' | 'form-completed-redirect',
        is_active: form.is_active,
      });
    }
  }, [form, formMethods]);

  const onSubmit = async (data: FormData) => {
    if (!form) return;

    try {
      const { error } = await supabase
        .from('forms')
        .update({
          title: data.title,
          description: data.description || null,
          slug: data.slug,
          form_type: data.form_type,
          completion_behavior: data.completion_behavior,
          is_active: data.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', form.id);

      if (error) throw error;

      toast({
        title: 'Form aggiornato',
        description: 'Le modifiche sono state salvate con successo.',
      });

      onFormUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating form:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare il form. Riprova.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modifica Form</DialogTitle>
          <DialogDescription>
            Modifica le impostazioni del form. Le modifiche verranno salvate immediatamente.
          </DialogDescription>
        </DialogHeader>

        <Form {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={formMethods.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titolo</FormLabel>
                    <FormControl>
                      <Input placeholder="Titolo del form" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formMethods.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Stato</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Form attivo/disattivo
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={formMethods.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrizione del form" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={formMethods.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="form-slug" 
                        {...field} 
                        disabled
                        className="bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formMethods.control}
                name="form_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo Form</FormLabel>
                    <FormControl>
                      <Input placeholder="Tipo del form" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={formMethods.control}
              name="completion_behavior"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comportamento al Completamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona comportamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="form-completed">form-completed</SelectItem>
                      <SelectItem value="form-completed-redirect">form-completed-redirect</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annulla
              </Button>
              <Button type="submit" className="bg-[#245C4F] hover:bg-[#1e4f44]">
                Salva Modifiche
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}