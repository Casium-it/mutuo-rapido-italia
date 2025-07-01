
import { Block } from "@/types/form";
import { allBlocks } from "@/data/blocks";
import { FormSnapshot, formSnapshotService } from "./formSnapshotService";

export interface FormDefinition {
  blocks: Block[];
  source: 'database' | 'hardcoded';
  formSlug?: string;
  version?: number;
}

class FormDefinitionService {
  /**
   * Get form definition - first try database, fallback to hard-coded blocks
   */
  async getFormDefinition(formSlug?: string): Promise<FormDefinition> {
    console.log(`FormDefinitionService: Getting form definition for ${formSlug || 'default'}`);

    // If no form slug provided, use hard-coded blocks
    if (!formSlug) {
      console.log('FormDefinitionService: No form slug provided, using hard-coded blocks');
      return {
        blocks: allBlocks,
        source: 'hardcoded'
      };
    }

    try {
      // Try to load from database first
      const snapshot = await formSnapshotService.loadFormSnapshot(formSlug);
      
      if (snapshot && this.validateFormSnapshot(snapshot)) {
        console.log(`FormDefinitionService: Using database form definition for ${formSlug}`);
        return {
          blocks: snapshot.blocks,
          source: 'database',
          formSlug: snapshot.slug,
          version: snapshot.version
        };
      } else {
        console.log(`FormDefinitionService: Database form not found or invalid, falling back to hard-coded blocks for ${formSlug}`);
      }
    } catch (error) {
      console.error(`FormDefinitionService: Error loading database form ${formSlug}, falling back to hard-coded:`, error);
    }

    // Fallback to hard-coded blocks
    return {
      blocks: allBlocks,
      source: 'hardcoded'
    };
  }

  /**
   * Check if a form exists in database
   */
  async isFormInDatabase(formSlug: string): Promise<boolean> {
    try {
      return await formSnapshotService.formExists(formSlug);
    } catch (error) {
      console.error(`FormDefinitionService: Error checking if form exists in database: ${formSlug}`, error);
      return false;
    }
  }

  /**
   * Validate form snapshot has required structure
   */
  private validateFormSnapshot(snapshot: FormSnapshot): boolean {
    if (!snapshot || !Array.isArray(snapshot.blocks)) {
      console.error('FormDefinitionService: Invalid snapshot - missing or invalid blocks array');
      return false;
    }

    // Validate each block has required properties
    for (const block of snapshot.blocks) {
      if (!block.block_id || !block.title || !Array.isArray(block.questions)) {
        console.error('FormDefinitionService: Invalid block structure:', block);
        return false;
      }

      // Validate each question has required properties
      for (const question of block.questions) {
        if (!question.question_id || !question.question_text) {
          console.error('FormDefinitionService: Invalid question structure:', question);
          return false;
        }
      }
    }

    console.log(`FormDefinitionService: Form snapshot validation passed for ${snapshot.slug}`);
    return true;
  }

  /**
   * Transform hard-coded blocks to database format (for migration)
   */
  transformBlocksForDatabase(blocks: Block[]): any[] {
    return blocks.map((block, index) => ({
      block_data: block,
      sort_order: index
    }));
  }
}

// Export singleton instance
export const formDefinitionService = new FormDefinitionService();
