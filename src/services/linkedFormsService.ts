
import { supabase } from "@/integrations/supabase/client";

export interface LinkedFormData {
  name: string;
  phone_number: string;
  email: string;
  form_slug?: string;
  link?: string;
  state?: string;
  percentage?: number;
}

export interface CreateLinkedFormResult {
  success: boolean;
  linkedFormId?: string;
  error?: string;
}

export interface CreateLinkedSimulationResult {
  success: boolean;
  resumeCode?: string;
  linkedFormId?: string;
  error?: string;
}

/**
 * Creates a new linked form record
 */
export async function createLinkedForm(data: LinkedFormData): Promise<CreateLinkedFormResult> {
  try {
    console.log('📝 Creating linked form:', data);

    const { data: linkedForm, error } = await supabase
      .from('linked_forms')
      .insert({
        name: data.name,
        phone_number: data.phone_number,
        email: data.email,
        form_slug: data.form_slug || 'simulazione-mutuo',
        link: data.link,
        state: data.state || 'active',
        percentage: data.percentage || 0
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ Error creating linked form:', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('✅ Linked form created successfully:', linkedForm.id);
    return {
      success: true,
      linkedFormId: linkedForm.id
    };

  } catch (error) {
    console.error('💥 Unexpected error creating linked form:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error occurred'
    };
  }
}

/**
 * Creates a saved simulation linked to a linked form
 */
export async function createLinkedSavedSimulation(
  name: string,
  phone: string,
  email: string,
  formSlug: string,
  linkedFormId: string
): Promise<CreateLinkedSimulationResult> {
  try {
    console.log('🔗 Creating linked saved simulation for:', { name, email, formSlug, linkedFormId });

    const { data, error } = await supabase.functions.invoke('create-saved-simulation-linked', {
      body: {
        name,
        phone,
        email,
        formSlug,
        linkedFormId
      }
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create linked simulation'
      };
    }

    if (!data.success) {
      console.error('❌ Linked simulation creation failed:', data.error);
      return {
        success: false,
        error: data.error
      };
    }

    console.log('✅ Linked saved simulation created successfully');
    return {
      success: true,
      resumeCode: data.resumeCode,
      linkedFormId: data.linkedFormId
    };

  } catch (error) {
    console.error('💥 Unexpected error creating linked simulation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error occurred'
    };
  }
}

/**
 * Updates the link field in a linked form record
 */
export async function updateLinkedFormLink(linkedFormId: string, link: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('linked_forms')
      .update({ link })
      .eq('id', linkedFormId);

    if (error) {
      console.error('❌ Error updating linked form link:', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('✅ Linked form link updated successfully');
    return { success: true };

  } catch (error) {
    console.error('💥 Unexpected error updating linked form link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error occurred'
    };
  }
}
