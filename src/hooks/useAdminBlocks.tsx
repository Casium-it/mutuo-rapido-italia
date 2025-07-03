
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Block } from '@/types/form';

interface AdminBlock extends Block {
  form_id: string;
  form_title: string;
  form_slug: string;
  form_type: string;
}

export function useAdminBlocks() {
  const [blocks, setBlocks] = useState<AdminBlock[]>([]);
  const [forms, setForms] = useState<Array<{ id: string; title: string; slug: string; form_type: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBlocksFromDatabase();
  }, []);

  const loadBlocksFromDatabase = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load forms first
      const { data: formsData, error: formsError } = await supabase
        .from('forms')
        .select('id, title, slug, form_type')
        .eq('is_active', true)
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

  const getStats = () => {
    const blocksByForm = getBlocksByForm();
    return {
      totalBlocks: blocks.length,
      totalForms: forms.length,
      blocksByForm: Object.entries(blocksByForm).map(([formSlug, formBlocks]) => ({
        formSlug,
        formTitle: forms.find(f => f.slug === formSlug)?.title || formSlug,
        count: formBlocks.length,
      })),
    };
  };

  return {
    blocks,
    forms,
    loading,
    error,
    getFilteredBlocks,
    getBlocksByForm,
    getStats,
    refetch: loadBlocksFromDatabase,
  };
}
