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
        
        // Simple query: start from user_roles and join with profiles
        const { data: userRoles, error } = await supabase
          .from('user_roles')
          .select(`
            user_id,
            profiles (
              id,
              first_name,
              last_name
            )
          `)
          .eq('role', 'mediatore');
        
        console.log('👥 Mediatori query result:', { userRoles, error });
        
        if (error) {
          console.error('❌ Error fetching mediatori:', error);
          return;
        }

        if (userRoles) {
          // Transform the data to match our interface
          const mediatori = userRoles
            .filter(ur => ur.profiles) // Ensure profiles exist
            .map(ur => ({
              id: ur.profiles.id,
              first_name: ur.profiles.first_name,
              last_name: ur.profiles.last_name
            }));
          
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