
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createAdminUser } from '@/utils/createAdminUser';
import { toast } from '@/hooks/use-toast';

export function CreateAdminButton() {
  const [loading, setLoading] = useState(false);

  const handleCreateAdmin = async () => {
    setLoading(true);
    try {
      const result = await createAdminUser();
      
      if (result.success) {
        toast({
          title: "Admin creato con successo",
          description: "L'account admin è stato creato correttamente",
        });
      } else {
        toast({
          title: "Errore",
          description: result.error || "Errore durante la creazione dell'admin",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore imprevisto durante la creazione dell'admin",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCreateAdmin}
      disabled={loading}
      className="bg-[#245C4F] hover:bg-[#1e4f44]"
    >
      {loading ? 'Creazione in corso...' : 'Crea Admin'}
    </Button>
  );
}
