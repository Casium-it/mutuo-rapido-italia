
import { supabase } from "@/integrations/supabase/client";
import { Block } from "@/types/form";

export interface FormSummary {
  id: string;
  slug: string;
  title: string;
  description?: string;
  blockCount: number;
  isActive: boolean;
}

export interface AdminBlock {
  blockId: string;
  title: string;
  priority: number;
  questionCount: number;
  formSlug: string;
  formTitle: string;
  blockNumber: string;
  properties: {
    defaultActive?: boolean;
    invisible?: boolean;
    multiBlock?: boolean;
    blueprintId?: string;
    copyNumber?: number;
  };
}

export interface AdminBlockDetail extends AdminBlock {
  questions: any[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

class AdminBlockService {
  async getAllForms(): Promise<FormSummary[]> {
    try {
      const { data: forms, error: formsError } = await supabase
        .from('forms')
        .select('id, slug, title, description, is_active')
        .eq('is_active', true)
        .order('title');

      if (formsError) throw formsError;

      // Get block counts for each form
      const formsWithCounts = await Promise.all(
        (forms || []).map(async (form) => {
          const { count } = await supabase
            .from('form_blocks')
            .select('*', { count: 'exact', head: true })
            .eq('form_id', form.id);

          return {
            id: form.id,
            slug: form.slug,
            title: form.title,
            description: form.description,
            blockCount: count || 0,
            isActive: form.is_active
          };
        })
      );

      return formsWithCounts;
    } catch (error) {
      console.error('Error fetching forms:', error);
      throw new Error('Errore nel caricamento dei form');
    }
  }

  async getAllBlocks(): Promise<AdminBlock[]> {
    try {
      const { data, error } = await supabase
        .from('form_blocks')
        .select(`
          block_data,
          sort_order,
          forms!inner(slug, title)
        `)
        .order('sort_order');

      if (error) throw error;

      return (data || []).map(item => this.transformToAdminBlock(item));
    } catch (error) {
      console.error('Error fetching all blocks:', error);
      throw new Error('Errore nel caricamento dei blocchi');
    }
  }

  async getBlocksByForm(formSlug: string): Promise<AdminBlock[]> {
    try {
      const { data, error } = await supabase
        .from('form_blocks')
        .select(`
          block_data,
          sort_order,
          forms!inner(slug, title)
        `)
        .eq('forms.slug', formSlug)
        .order('sort_order');

      if (error) throw error;

      return (data || []).map(item => this.transformToAdminBlock(item));
    } catch (error) {
      console.error('Error fetching blocks by form:', error);
      throw new Error('Errore nel caricamento dei blocchi per il form');
    }
  }

  async getBlockDetail(blockId: string, formSlug?: string): Promise<AdminBlockDetail | null> {
    try {
      let query = supabase
        .from('form_blocks')
        .select(`
          block_data,
          sort_order,
          created_at,
          updated_at,
          forms!inner(slug, title)
        `);

      if (formSlug) {
        query = query.eq('forms.slug', formSlug);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Find the block with matching block_id in the block_data
      const blockItem = (data || []).find(item => {
        const blockData = item.block_data as Block;
        return blockData.block_id === blockId;
      });

      if (!blockItem) return null;

      return this.transformToAdminBlockDetail(blockItem);
    } catch (error) {
      console.error('Error fetching block detail:', error);
      throw new Error('Errore nel caricamento del dettaglio blocco');
    }
  }

  private transformToAdminBlock(item: any): AdminBlock {
    const blockData = item.block_data as Block;
    const form = item.forms;

    return {
      blockId: blockData.block_id,
      title: blockData.title,
      priority: blockData.priority,
      questionCount: blockData.questions?.length || 0,
      formSlug: form.slug,
      formTitle: form.title,
      blockNumber: blockData.block_number,
      properties: {
        defaultActive: blockData.default_active,
        invisible: blockData.invisible,
        multiBlock: blockData.multiBlock,
        blueprintId: blockData.blueprint_id,
        copyNumber: blockData.copy_number
      }
    };
  }

  private transformToAdminBlockDetail(item: any): AdminBlockDetail {
    const blockData = item.block_data as Block;
    const form = item.forms;

    return {
      blockId: blockData.block_id,
      title: blockData.title,
      priority: blockData.priority,
      questionCount: blockData.questions?.length || 0,
      formSlug: form.slug,
      formTitle: form.title,
      blockNumber: blockData.block_number,
      properties: {
        defaultActive: blockData.default_active,
        invisible: blockData.invisible,
        multiBlock: blockData.multiBlock,
        blueprintId: blockData.blueprint_id,
        copyNumber: blockData.copy_number
      },
      questions: blockData.questions || [],
      sortOrder: item.sort_order,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    };
  }
}

export const adminBlockService = new AdminBlockService();
