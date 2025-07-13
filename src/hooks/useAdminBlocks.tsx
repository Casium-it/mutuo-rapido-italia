
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Block } from '@/types/form';

interface AdminBlock extends Block {
  id: string;
  form_id: string;
  form_title: string;
  form_slug: string;
  form_type: string;
}

interface FormData {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  form_type: string;
  completion_behavior: string;
  is_active: boolean;
  version: number;
}

export function useAdminBlocks() {
  const [blocks, setBlocks] = useState<AdminBlock[]>([]);
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBlocksFromDatabase();
  }, []);

  const loadBlocksFromDatabase = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load forms first (including inactive ones for admin interface)
      const { data: formsData, error: formsError } = await supabase
        .from('forms')
        .select('id, title, description, slug, form_type, completion_behavior, is_active, version')
        .order('title');

      if (formsError) throw formsError;
      
      setForms(formsData || []);

      // Load blocks with form information
      const { data: blocksData, error: blocksError } = await supabase
        .from('form_blocks')
        .select(`
          id,
          block_data,
          sort_order,
          form_id,
          forms!inner(
            id,
            title,
            slug,
            form_type
          )
        `)
        .order('sort_order');

      if (blocksError) throw blocksError;

      // Transform database blocks to AdminBlock format
      const transformedBlocks: AdminBlock[] = (blocksData || []).map((item: any) => {
        const blockData = item.block_data as Block;
        return {
          ...blockData,
          id: item.id,
          form_id: item.form_id,
          form_title: item.forms.title,
          form_slug: item.forms.slug,
          form_type: item.forms.form_type,
        };
      });

      setBlocks(transformedBlocks);
    } catch (err) {
      console.error('Error loading blocks from database:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBlocks = (formFilter: string | null) => {
    if (!formFilter || formFilter === 'all') {
      return blocks;
    }
    return blocks.filter(block => block.form_slug === formFilter);
  };

  const getBlocksByForm = () => {
    const blocksByForm: Record<string, AdminBlock[]> = {};
    blocks.forEach(block => {
      if (!blocksByForm[block.form_slug]) {
        blocksByForm[block.form_slug] = [];
      }
      blocksByForm[block.form_slug].push(block);
    });
    return blocksByForm;
  };

  const getTotalQuestions = (formSlug: string) => {
    const formBlocks = blocks.filter(block => block.form_slug === formSlug);
    return formBlocks.reduce((total, block) => {
      return total + (block.questions?.length || 0);
    }, 0);
  };

  const getStats = () => {
    const blocksByForm = getBlocksByForm();
    return {
      totalBlocks: blocks.length,
      totalForms: forms.length,
      blocksByForm: Object.entries(blocksByForm).map(([formSlug, formBlocks]) => ({
        formSlug,
        formTitle: forms.find(f => f.slug === formSlug)?.title || formSlug,
        count: formBlocks.length,
        totalQuestions: getTotalQuestions(formSlug),
      })),
    };
  };

  const updateBlock = async (blockId: string, updatedBlock: Block, newFormId?: string) => {
    try {
      const currentBlock = blocks.find(b => b.block_id === blockId);
      if (!currentBlock) {
        throw new Error('Block not found');
      }

      const formId = newFormId || currentBlock.form_id;
      
      const { error } = await supabase
        .from('form_blocks')
        .update({
          block_data: updatedBlock,
          form_id: formId,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentBlock.id);

      if (error) throw error;

      // Refresh data
      await loadBlocksFromDatabase();
    } catch (error) {
      console.error('Error updating block:', error);
      throw error;
    }
  };

  const duplicateBlock = async (block: Block, targetFormId: string) => {
    try {
      // Find the target form to get the next block number
      const targetForm = forms.find(f => f.id === targetFormId);
      if (!targetForm) {
        throw new Error('Target form not found');
      }

      // Get existing blocks in target form to determine next block number
      const targetFormBlocks = blocks.filter(b => b.form_id === targetFormId);
      const maxBlockNumber = Math.max(
        ...targetFormBlocks.map(b => parseInt(b.block_number) || 0),
        0
      );
      const nextBlockNumber = (maxBlockNumber + 1).toString();

      // Create the duplicated block with new ID and number
      const duplicatedBlock: Block = {
        ...block,
        block_id: `${block.block_id}_copy_${Date.now()}`,
        block_number: nextBlockNumber,
        title: `${block.title} (Copia)`,
        copy_number: (block.copy_number || 0) + 1
      };

      const { error } = await supabase
        .from('form_blocks')
        .insert({
          form_id: targetFormId,
          block_data: duplicatedBlock,
          sort_order: parseInt(nextBlockNumber)
        });

      if (error) throw error;

      // Refresh data
      await loadBlocksFromDatabase();
    } catch (error) {
      console.error('Error duplicating block:', error);
      throw error;
    }
  };

  return {
    blocks,
    forms,
    loading,
    error,
    getFilteredBlocks,
    getBlocksByForm,
    getStats,
    getTotalQuestions,
    updateBlock,
    duplicateBlock,
    refetch: loadBlocksFromDatabase,
  };
}
