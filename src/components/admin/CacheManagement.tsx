
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Trash2, Database, Timer, HardDrive } from 'lucide-react';
import { formCacheService } from '@/services/formCacheService';
import { preloadService } from '@/services/preloadService';
import { toast } from 'sonner';

interface CacheStats {
  totalEntries: number;
  totalHits: number;
  cacheSize: string;
  lastUpdated: number;
}

export const CacheManagement: React.FC = () => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [preloadStatus, setPreloadStatus] = useState({ isPreloading: false, hasCompleted: false });

  // Load initial stats
  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStats = () => {
    try {
      const cacheStats = formCacheService.getCacheStats();
      const status = preloadService.getStatus();
      setStats(cacheStats);
      setPreloadStatus(status);
    } catch (error) {
      console.error('Error loading cache stats:', error);
    }
  };

  const handleRefreshCache = async () => {
    setIsRefreshing(true);
    try {
      await preloadService.refreshAllCaches();
      toast.success('Cache aggiornata con successo');
      loadStats();
    } catch (error) {
      console.error('Error refreshing cache:', error);
      toast.error('Errore durante l\'aggiornamento della cache');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearCache = () => {
    setIsClearing(true);
    try {
      formCacheService.clearAllCaches();
      toast.success('Cache svuotata con successo');
      loadStats();
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Errore durante lo svuotamento della cache');
    } finally {
      setIsClearing(false);
    }
  };

  const formatLastUpdated = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours} ore fa`;
    } else if (minutes > 0) {
      return `${minutes} minuti fa`;
    } else {
      return 'Appena ora';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Gestione Cache</h2>
        <p className="text-muted-foreground">
          Monitora e gestisci la cache dei moduli per ottimizzare le prestazioni
        </p>
      </div>

      {/* Cache Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moduli in Cache</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEntries || 0}</div>
            <p className="text-xs text-muted-foreground">
              Moduli memorizzati
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hit Cache</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalHits || 0}</div>
            <p className="text-xs text-muted-foreground">
              Accessi dalla cache
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dimensione Cache</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.cacheSize || '0 Bytes'}</div>
            <p className="text-xs text-muted-foreground">
              Spazio utilizzato
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ultimo Aggiornamento</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {stats ? formatLastUpdated(stats.lastUpdated) : 'Mai'}
            </div>
            <p className="text-xs text-muted-foreground">
              Cache aggiornata
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cache Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Controlli Cache</CardTitle>
          <CardDescription>
            Gestisci la cache dei moduli per migliorare le prestazioni dell'applicazione
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preload Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Stato Precaricamento</p>
              <p className="text-sm text-muted-foreground">
                Stato del precaricamento automatico dei moduli comuni
              </p>
            </div>
            <div className="flex items-center gap-2">
              {preloadStatus.isPreloading && (
                <Badge variant="secondary">
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  In corso
                </Badge>
              )}
              {preloadStatus.hasCompleted && !preloadStatus.isPreloading && (
                <Badge variant="default">Completato</Badge>
              )}
              {!preloadStatus.hasCompleted && !preloadStatus.isPreloading && (
                <Badge variant="outline">Non iniziato</Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleRefreshCache}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Aggiornamento...' : 'Aggiorna Cache'}
            </Button>

            <Button
              variant="outline"
              onClick={handleClearCache}
              disabled={isClearing}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isClearing ? 'Svuotamento...' : 'Svuota Cache'}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Aggiorna Cache:</strong> Ricarica tutti i moduli dalla base dati mantenendo le prestazioni ottimali.
            </p>
            <p className="mt-1">
              <strong>Svuota Cache:</strong> Rimuove tutti i dati dalla cache. I moduli verranno ricaricati al prossimo accesso.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
