
/**
 * Form State Debugging Utilities for browser console
 */
class FormStateDebugger {
  private getFormType(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    const pathSegments = window.location.pathname.split('/');
    
    // Check for form slug route (/form/[slug])
    if (pathSegments[1] === 'form' && pathSegments[2]) {
      return pathSegments[2];
    }
    
    // Check for legacy blockType route (/simulazione/[blockType])
    if (pathSegments[1] === 'simulazione' && pathSegments[2]) {
      return pathSegments[2];
    }
    
    return null;
  }

  /**
   * Get current form state from localStorage
   */
  getCurrentState() {
    const formType = this.getFormType();
    if (!formType) {
      console.log('❌ No form type detected from current URL');
      return null;
    }
    
    const key = `form-state-${formType}`;
    const savedState = localStorage.getItem(key);
    
    if (!savedState) {
      console.log(`❌ No saved state found for key: ${key}`);
      return null;
    }
    
    try {
      const parsedState = JSON.parse(savedState);
      console.log(`✅ Current form state for key: ${key}`, parsedState);
      return parsedState;
    } catch (error) {
      console.error(`❌ Failed to parse saved state for key: ${key}`, error);
      return null;
    }
  }

  /**
   * Get form responses only
   */
  getResponses() {
    const state = this.getCurrentState();
    if (!state) return null;
    
    console.group('📝 Form Responses');
    console.log('Total questions answered:', Object.keys(state.responses || {}).length);
    console.log('Responses:', state.responses || {});
    console.groupEnd();
    
    return state.responses || {};
  }

  /**
   * Get answered questions
   */
  getAnsweredQuestions() {
    const state = this.getCurrentState();
    if (!state) return null;
    
    const answeredQuestions = Array.isArray(state.answeredQuestions) 
      ? state.answeredQuestions 
      : [];
    
    console.group('✅ Answered Questions');
    console.log('Total answered:', answeredQuestions.length);
    console.log('Question IDs:', answeredQuestions);
    console.groupEnd();
    
    return answeredQuestions;
  }

  /**
   * Get active and completed blocks
   */
  getBlocks() {
    const state = this.getCurrentState();
    if (!state) return null;
    
    console.group('📦 Form Blocks');
    console.log('Active blocks:', state.activeBlocks || []);
    console.log('Completed blocks:', state.completedBlocks || []);
    console.log('Dynamic blocks:', state.dynamicBlocks || []);
    console.groupEnd();
    
    return {
      active: state.activeBlocks || [],
      completed: state.completedBlocks || [],
      dynamic: state.dynamicBlocks || []
    };
  }

  /**
   * Clear current form state
   */
  clearState() {
    const formType = this.getFormType();
    if (!formType) {
      console.log('❌ No form type detected from current URL');
      return false;
    }
    
    const key = `form-state-${formType}`;
    localStorage.removeItem(key);
    console.log(`🧹 Cleared form state for key: ${key}`);
    console.log('⚠️ Refresh the page to see the reset form');
    return true;
  }

  /**
   * Export current state as JSON
   */
  exportState() {
    const state = this.getCurrentState();
    if (!state) return null;
    
    const exportData = JSON.stringify(state, null, 2);
    console.log('📤 Exported form state (copy from below):');
    console.log(exportData);
    return exportData;
  }

  /**
   * Import state from JSON string
   */
  importState(jsonString: string) {
    const formType = this.getFormType();
    if (!formType) {
      console.log('❌ No form type detected from current URL');
      return false;
    }
    
    try {
      const parsedState = JSON.parse(jsonString);
      const key = `form-state-${formType}`;
      localStorage.setItem(key, JSON.stringify(parsedState));
      console.log(`📥 Imported form state for key: ${key}`);
      console.log('⚠️ Refresh the page to see the imported state');
      return true;
    } catch (error) {
      console.error('❌ Failed to import state:', error);
      return false;
    }
  }

  /**
   * Monitor localStorage changes in real-time
   */
  startMonitoring() {
    const formType = this.getFormType();
    if (!formType) {
      console.log('❌ No form type detected from current URL');
      return null;
    }
    
    const key = `form-state-${formType}`;
    let lastState = localStorage.getItem(key);
    
    console.log(`👁️ Starting form state monitoring for key: ${key}`);
    
    const monitor = () => {
      const currentState = localStorage.getItem(key);
      if (currentState !== lastState) {
        console.log(`🔄 Form state changed for key: ${key}`);
        try {
          const parsed = JSON.parse(currentState || '{}');
          console.log('New state:', {
            responses: Object.keys(parsed.responses || {}).length,
            answeredQuestions: Array.isArray(parsed.answeredQuestions) ? parsed.answeredQuestions.length : 0,
            activeBlocks: (parsed.activeBlocks || []).length,
            completedBlocks: (parsed.completedBlocks || []).length
          });
        } catch (e) {
          console.log('Raw state:', currentState);
        }
        lastState = currentState;
      }
    };
    
    const interval = setInterval(monitor, 1000);
    
    return () => {
      clearInterval(interval);
      console.log('⏹️ Form state monitoring stopped');
    };
  }

  /**
   * Show help
   */
  help() {
    console.group('🛠️ Form State Debugger Help');
    console.log('📍 getCurrentState() - Get current form state from localStorage');
    console.log('📝 getResponses() - Show all form responses');
    console.log('✅ getAnsweredQuestions() - Show answered question IDs');
    console.log('📦 getBlocks() - Show active/completed/dynamic blocks');
    console.log('🧹 clearState() - Clear current form state');
    console.log('📤 exportState() - Export state as JSON');
    console.log('📥 importState(json) - Import state from JSON string');
    console.log('👁️ startMonitoring() - Monitor state changes in real-time');
    console.log('🛠️ help() - Show this help');
    console.groupEnd();
  }
}

// Create global debugger instance
const formStateDebugger = new FormStateDebugger();

// Make it available globally for console access
declare global {
  interface Window {
    formStateDebugger: FormStateDebugger;
  }
}

if (typeof window !== 'undefined') {
  window.formStateDebugger = formStateDebugger;
  
  // Show helpful message on first load
  console.log('🚀 Form State Debugger loaded! Try these commands:');
  console.log('- window.formStateDebugger.help() - Show all available commands');
  console.log('- window.formStateDebugger.getCurrentState() - View current form state');
  console.log('- window.formStateDebugger.getResponses() - View form responses');
}

export { formStateDebugger };
