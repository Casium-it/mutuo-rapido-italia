
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Testing() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Test Funzionalità</CardTitle>
          <CardDescription className="text-center">
            Prova la nuova funzionalità di gestione delle fonti di reddito multiple
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center">
            Abbiamo implementato una nuova funzionalità che permette di gestire multiple fonti di reddito aggiuntive, 
            utilizzando un approccio simile a quello di Pretto.
          </p>
          
          <div className="bg-[#F8F4EF] p-4 rounded-md">
            <h3 className="text-[#245C4F] font-medium mb-2">Funzionalità implementate:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Aggiunta di multiple fonti di reddito</li>
              <li>Dettagli specifici per ogni tipo di reddito</li>
              <li>Visualizzazione riepilogativa delle fonti aggiunte</li>
              <li>Modifica e rimozione delle fonti esistenti</li>
              <li>Gestione dello stato completo di ogni fonte</li>
            </ul>
          </div>
          
          <div className="text-center space-y-4">
            <p className="font-medium">Per testare la funzionalità, vai alla simulazione:</p>
            <div className="space-x-4">
              <Link to="/simulazione/pensando">
                <Button 
                  className="bg-[#245C4F] hover:bg-[#1e4f44]"
                >
                  Avvia la simulazione
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              Nella simulazione, vai alla sezione "Reddito secondario" per provare la nuova funzionalità.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
