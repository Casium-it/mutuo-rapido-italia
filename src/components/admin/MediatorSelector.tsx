import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface Mediatore {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

interface MediatoreSelectorProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
}

export function MediatoreSelector({ value, onValueChange }: MediatoreSelectorProps) {
  const [mediatori, setMediatori] = useState<Mediatore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMediatori = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            user_roles!inner(role)
          `)
          .eq('user_roles.role', 'mediatore');

        if (!error && data) {
          setMediatori(data);
        }
      } catch (error) {
        console.error('Error fetching mediatori:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMediatori();
  }, []);

  const getDisplayName = (mediatore: Mediatore) => {
    const firstName = mediatore.first_name || '';
    const lastName = mediatore.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Mediatore senza nome';
  };

  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-gray-600">Mediatore</Label>
      <Select 
        value={value || 'unassigned'} 
        onValueChange={(newValue) => {
          const finalValue = newValue === 'unassigned' ? null : newValue;
          onValueChange(finalValue);
        }}
        disabled={loading}
      >
        <SelectTrigger>
          <SelectValue placeholder={loading ? "Caricamento..." : "Seleziona mediatore"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">Nessuno</SelectItem>
          {mediatori.map((mediatore) => (
            <SelectItem key={mediatore.id} value={mediatore.id}>
              {getDisplayName(mediatore)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}