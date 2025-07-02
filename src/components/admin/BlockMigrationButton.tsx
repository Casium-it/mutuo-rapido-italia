
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { blockMigrationService, MigrationResult } from '@/services/blockMigrationService';
import { toast } from '@/hooks/use-toast';

export const BlockMigrationButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'pending' | 'completed' | 'error'>('pending');
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);

  // Controlla lo stato della migrazione al caricamento
  useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = async () => {
    try {
      const status = await blockMigrationService.checkMigrationStatus();
      if (status.formExists && status.blocksCount > 0) {
        setMigrationStatus('completed');
        setMigrationResult({
          success: true,
          message: `Form 'simulazione-mutuo' già presente con ${status.blocksCount} blocchi`,
          details: {
            formId: status.formId,
            blocksCount: status.blocksCount
          }
        });
      }
    } catch (error) {
      console.error('Error checking migration status:', error);
    }
  };

  const handleMigration = async () => {
    setIsLoading(true);
    
    try {
      const result = await blockMigrationService.migrateStaticBlocks();
      setMigrationResult(result);
      
      if (result.success) {
        setMigrationStatus('completed');
        toast({
          title: "Migrazione Completata",
          description: result.message,
        });
      } else {
        setMigrationStatus('error');
        toast({
          title: "Errore Migrazione",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationStatus('error');
      toast({
        title: "Errore",
        description: "Errore imprevisto durante la migrazione",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Migrazione in corso...
        </>
      );
    }

    switch (migrationStatus) {
      case 'completed':
        return (
          <>
            <CheckCircle className="h-4 w-4" />
            Migrazione completata ✓
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="h-4 w-4" />
            Errore migrazione - Riprova
          </>
        );
      default:
        return (
          <>
            <Database className="h-4 w-4" />
            Migra Blocchi
          </>
        );
    }
  };

  const isDisabled = isLoading || migrationStatus === 'completed';

  return (
    <Button
      onClick={handleMigration}
      disabled={isDisabled}
      variant="outline"
      className={`flex items-center gap-2 ${
        migrationStatus === 'completed' 
          ? 'border-green-200 text-green-700 bg-green-50' 
          : migrationStatus === 'error'
          ? 'border-red-200 text-red-700 bg-red-50'
          : ''
      }`}
    >
      {getButtonContent()}
    </Button>
  );
};
