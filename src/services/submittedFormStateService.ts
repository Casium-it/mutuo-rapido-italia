import { FormState } from "@/types/form";

export interface SubmittedFormState {
  submissionId: string;
  formState: FormState;
  timestamp: number;
  formSlug: string;
}

class SubmittedFormStateService {
  private getStorageKey(formSlug: string): string {
    return `submitted-forms-${formSlug}`;
  }

  /**
   * Save a submitted form state connected to its submission ID
   */
  saveSubmittedFormState(
    submissionId: string,
    formState: FormState,
    formSlug: string
  ): void {
    try {
      const storageKey = this.getStorageKey(formSlug);
      const existingStates = this.getSubmittedFormStates(formSlug);
      
      const newSubmittedState: SubmittedFormState = {
        submissionId,
        formState: {
          ...formState,
          // Convert Set to Array for storage
          answeredQuestions: Array.from(formState.answeredQuestions)
        } as any,
        timestamp: Date.now(),
        formSlug
      };
      
      // Add to beginning of array (most recent first)
      const updatedStates = [newSubmittedState, ...existingStates];
      
      // Keep only last 10 submissions per form to prevent localStorage bloat
      const trimmedStates = updatedStates.slice(0, 10);
      
      localStorage.setItem(storageKey, JSON.stringify(trimmedStates));
      
      console.log(`✅ Saved submitted form state for submission ${submissionId}`);
    } catch (error) {
      console.error('Error saving submitted form state:', error);
    }
  }

  /**
   * Get all submitted form states for a specific form
   */
  getSubmittedFormStates(formSlug: string): SubmittedFormState[] {
    try {
      const storageKey = this.getStorageKey(formSlug);
      const stored = localStorage.getItem(storageKey);
      
      if (!stored) return [];
      
      const states = JSON.parse(stored) as SubmittedFormState[];
      
      // Convert answeredQuestions back to Set for each state
      return states.map(state => ({
        ...state,
        formState: {
          ...state.formState,
          answeredQuestions: new Set(Array.isArray(state.formState.answeredQuestions) ? state.formState.answeredQuestions : [])
        }
      }));
    } catch (error) {
      console.error('Error getting submitted form states:', error);
      return [];
    }
  }

  /**
   * Get a specific submitted form state by submission ID
   */
  getSubmittedFormState(submissionId: string, formSlug: string): SubmittedFormState | null {
    const states = this.getSubmittedFormStates(formSlug);
    return states.find(state => state.submissionId === submissionId) || null;
  }

  /**
   * Clear all submitted form states for a specific form
   */
  clearSubmittedFormStates(formSlug: string): void {
    try {
      const storageKey = this.getStorageKey(formSlug);
      localStorage.removeItem(storageKey);
      console.log(`🗑️ Cleared submitted form states for ${formSlug}`);
    } catch (error) {
      console.error('Error clearing submitted form states:', error);
    }
  }

  /**
   * Reset current form state after successful submission
   */
  resetCurrentFormState(formSlug: string): void {
    try {
      const currentFormKey = `form-state-${formSlug}`;
      localStorage.removeItem(currentFormKey);
      console.log(`🔄 Reset current form state for ${formSlug}`);
    } catch (error) {
      console.error('Error resetting current form state:', error);
    }
  }
}

export const submittedFormStateService = new SubmittedFormStateService();
