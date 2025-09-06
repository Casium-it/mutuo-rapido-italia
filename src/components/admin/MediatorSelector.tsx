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
        console.log('🔄 Fetching mediatori...');
        
        // Use a direct query that matches the working SQL
        const { data: mediatori, error } = await supabase
          .rpc('get_mediatori_profiles');

        console.log('👥 Mediatori RPC result:', { mediatori, error });

        if (error) {
          console.error('❌ Error fetching mediatori:', error);
          // Fallback: try direct query
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', [
              '7f21eb70-8a2c-4b4a-9acd-7ffb8ea7f89c',
              '03ac07fd-5252-4df5-8e91-1613e6559f8c', 
              '4d009fd0-16c5-48fe-9180-01ccc5de5fba',
              '6439c4d4-d2e0-4c97-a581-b49467ce36a9'
            ]);
          
          console.log('📞 Fallback query result:', { fallbackData, fallbackError });
          
          if (!fallbackError && fallbackData) {
            setMediatori(fallbackData);
          }
          return;
        }

        if (mediatori) {
          console.log('✅ Successfully fetched mediatori:', mediatori);
          setMediatori(mediatori);
        }
      } catch (error) {
        console.error('💥 Exception fetching mediatori:', error);
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