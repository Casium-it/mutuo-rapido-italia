
import { supabase } from "@/integrations/supabase/client";
import { allBlocks } from "@/data/blocks";
import { Block } from "@/types/form";

export interface MigrationResult {
  success: boolean;
  message: string;
  details?: {
    formId?: string;
    blocksCount?: number;
    errors?: string[];
  };
}

class BlockMigrationService {
  /**
   * Migra tutti i blocchi statici nel database come form "simulazione-mutuo"
   */
  async migrateStaticBlocks(): Promise<MigrationResult> {
    console.log("BlockMigrationService: Starting migration of static blocks");
    
    try {
      // 1. Controlla se il form "simulazione-mutuo" esiste già
      const { data: existingForm, error: checkError } = await supabase
        .from('forms')
        .select('id, slug')
        .eq('slug', 'simulazione-mutuo')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("BlockMigrationService: Error checking existing form:", checkError);
        throw checkError;
      }

      if (existingForm) {
        console.log("BlockMigrationService: Form 'simulazione-mutuo' already exists");
        return {
          success: false,
          message: "Il form 'simulazione-mutuo' esiste già nel database",
          details: {
            formId: existingForm.id,
            blocksCount: 0
          }
        };
      }

      // 2. Crea il form "simulazione-mutuo"
      console.log("BlockMigrationService: Creating form 'simulazione-mutuo'");
      const { data: newForm, error: formError } = await supabase
        .from('forms')
        .insert({
          slug: 'simulazione-mutuo',
          title: 'Simulazione Mutuo',
          description: 'Form completo per simulazione mutuo con tutti i blocchi',
          form_type: 'simulazione',
          is_active: true,
          version: 1
        })
        .select('id')
        .single();

      if (formError) {
        console.error("BlockMigrationService: Error creating form:", formError);
        throw formError;
      }

      console.log("BlockMigrationService: Form created with ID:", newForm.id);

      // 3. Ordina i blocchi per priorità
      const sortedBlocks = [...allBlocks].sort((a, b) => a.priority - b.priority);
      console.log(`BlockMigrationService: Migrating ${sortedBlocks.length} blocks`);

      // 4. Prepara i dati dei blocchi per l'inserimento
      const blockData = sortedBlocks.map((block: Block, index: number) => ({
        form_id: newForm.id,
        block_data: block,
        sort_order: index + 1
      }));

      // 5. Inserisci tutti i blocchi in batch
      const { error: blocksError } = await supabase
        .from('form_blocks')
        .insert(blockData);

      if (blocksError) {
        console.error("BlockMigrationService: Error inserting blocks:", blocksError);
        // Cleanup: elimina il form se l'inserimento dei blocchi fallisce
        await supabase.from('forms').delete().eq('id', newForm.id);
        throw blocksError;
      }

      console.log(`BlockMigrationService: Successfully migrated ${sortedBlocks.length} blocks`);

      return {
        success: true,
        message: `Migrazione completata con successo! Form 'simulazione-mutuo' creato con ${sortedBlocks.length} blocchi.`,
        details: {
          formId: newForm.id,
          blocksCount: sortedBlocks.length
        }
      };

    } catch (error) {
      console.error("BlockMigrationService: Migration failed:", error);
      return {
        success: false,
        message: `Errore durante la migrazione: ${error.message}`,
        details: {
          errors: [error.message]
        }
      };
    }
  }

  /**
   * Verifica lo stato della migrazione
   */
  async checkMigrationStatus(): Promise<{
    formExists: boolean;
    blocksCount: number;
    formId?: string;
  }> {
    try {
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('id')
        .eq('slug', 'simulazione-mutuo')
        .single();

      if (formError && formError.code !== 'PGRST116') {
        console.error("BlockMigrationService: Error checking migration status:", formError);
        return { formExists: false, blocksCount: 0 };
      }

      if (!form) {
        return { formExists: false, blocksCount: 0 };
      }

      const { count, error: countError } = await supabase
        .from('form_blocks')
        .select('*', { count: 'exact', head: true })
        .eq('form_id', form.id);

      if (countError) {
        console.error("BlockMigrationService: Error counting blocks:", countError);
        return { formExists: true, blocksCount: 0, formId: form.id };
      }

      return {
        formExists: true,
        blocksCount: count || 0,
        formId: form.id
      };

    } catch (error) {
      console.error("BlockMigrationService: Error checking migration status:", error);
      return { formExists: false, blocksCount: 0 };
    }
  }
}

// Export singleton instance
export const blockMigrationService = new BlockMigrationService();
