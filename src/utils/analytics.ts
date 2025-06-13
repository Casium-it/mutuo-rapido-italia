
// GA4 Analytics utility functions
declare global {
  interface Window {
    gtag: (command: string, targetId: string | Date, config?: any) => void;
    dataLayer: any[];
  }
}

// Utility to check if gtag is available
const isGtagAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Session management for form duration tracking
class FormSessionManager {
  private static instance: FormSessionManager;
  private sessionStart: Date | null = null;
  private formType: string | null = null;

  static getInstance(): FormSessionManager {
    if (!FormSessionManager.instance) {
      FormSessionManager.instance = new FormSessionManager();
    }
    return FormSessionManager.instance;
  }

  startSession(formType: string): void {
    this.sessionStart = new Date();
    this.formType = formType;
    localStorage.setItem('form_session_start', this.sessionStart.toISOString());
    localStorage.setItem('form_session_type', formType);
  }

  getSessionDuration(): number | null {
    if (!this.sessionStart) {
      // Try to recover from localStorage
      const savedStart = localStorage.getItem('form_session_start');
      if (savedStart) {
        this.sessionStart = new Date(savedStart);
        this.formType = localStorage.getItem('form_session_type');
      } else {
        return null;
      }
    }
    
    const now = new Date();
    return Math.round((now.getTime() - this.sessionStart.getTime()) / 1000); // duration in seconds
  }

  endSession(): void {
    this.sessionStart = null;
    this.formType = null;
    localStorage.removeItem('form_session_start');
    localStorage.removeItem('form_session_type');
  }

  getFormType(): string | null {
    return this.formType || localStorage.getItem('form_session_type');
  }
}

export const formSession = FormSessionManager.getInstance();

// Contact view tracking
export const trackContactView = (contactType: 'whatsapp' | 'email' | 'phone', context: string) => {
  if (!isGtagAvailable()) return;
  
  window.gtag('event', 'contact_view', {
    contact_type: contactType,
    context: context,
    timestamp: new Date().toISOString()
  });
  
  console.log('GA4 Event: contact_view', { contactType, context });
};

// Form start tracking
export const trackFormStart = (formPath: string, formType: string) => {
  if (!isGtagAvailable()) return;
  
  // Start session tracking
  formSession.startSession(formType);
  
  window.gtag('event', 'form_start', {
    form_path: formPath,
    form_type: formType,
    timestamp: new Date().toISOString()
  });
  
  console.log('GA4 Event: form_start', { formPath, formType });
};

// Resume form tracking
export const trackFormResume = (outcome: 'success' | 'failed', resumeCode?: string, errorReason?: string) => {
  if (!isGtagAvailable()) return;
  
  const eventData: any = {
    outcome: outcome,
    timestamp: new Date().toISOString()
  };
  
  if (resumeCode) eventData.resume_code_length = resumeCode.length;
  if (errorReason) eventData.error_reason = errorReason;
  
  window.gtag('event', 'form_resume', eventData);
  
  console.log('GA4 Event: form_resume', eventData);
};

// Form reply tracking
export const trackFormReply = (questionId: string, blockId: string, answerValue: any, questionText?: string) => {
  if (!isGtagAvailable()) return;
  
  // Safely stringify answer value
  let answerString = '';
  try {
    if (typeof answerValue === 'object') {
      answerString = JSON.stringify(answerValue);
    } else {
      answerString = String(answerValue);
    }
  } catch (e) {
    answerString = 'complex_value';
  }
  
  window.gtag('event', 'form_reply', {
    question_id: questionId,
    block_id: blockId,
    answer_value: answerString.substring(0, 100), // Limit length for GA4
    question_text: questionText?.substring(0, 100),
    timestamp: new Date().toISOString()
  });
  
  console.log('GA4 Event: form_reply', { questionId, blockId, answerValue });
};

// Back navigation tracking
export const trackBackNavigation = (currentQuestionId: string, currentBlockId: string, navigationSource: string) => {
  if (!isGtagAvailable()) return;
  
  window.gtag('event', 'back_navigation', {
    current_question_id: currentQuestionId,
    current_block_id: currentBlockId,
    navigation_source: navigationSource,
    timestamp: new Date().toISOString()
  });
  
  console.log('GA4 Event: back_navigation', { currentQuestionId, currentBlockId, navigationSource });
};

// Exit form tracking
export const trackFormExit = (outcome: 'saved' | 'not_saved' | 'cancel_exit', currentQuestionId?: string, progress?: number) => {
  if (!isGtagAvailable()) return;
  
  const sessionDuration = formSession.getSessionDuration();
  const formType = formSession.getFormType();
  
  window.gtag('event', 'form_exit', {
    outcome: outcome,
    current_question_id: currentQuestionId,
    progress_percentage: progress,
    session_duration_seconds: sessionDuration,
    form_type: formType,
    timestamp: new Date().toISOString()
  });
  
  // End session if user actually exits
  if (outcome !== 'cancel_exit') {
    formSession.endSession();
  }
  
  console.log('GA4 Event: form_exit', { outcome, currentQuestionId, progress });
};

// Form submit tracking
export const trackFormSubmit = (formType: string, totalQuestions: number, completedBlocks: string[]) => {
  if (!isGtagAvailable()) return;
  
  const sessionDuration = formSession.getSessionDuration();
  
  window.gtag('event', 'form_submit', {
    form_type: formType,
    total_questions: totalQuestions,
    completed_blocks: completedBlocks.length,
    session_duration_seconds: sessionDuration,
    timestamp: new Date().toISOString()
  });
  
  // End the session
  formSession.endSession();
  
  console.log('GA4 Event: form_submit', { formType, totalQuestions, sessionDuration });
};

// Contact submission tracking
export const trackContactSubmission = (hasConsulting: boolean, submissionType: 'whatsapp' | 'email' | 'phone') => {
  if (!isGtagAvailable()) return;
  
  window.gtag('event', 'contact_submission', {
    consulting_requested: hasConsulting,
    submission_type: submissionType,
    timestamp: new Date().toISOString()
  });
  
  console.log('GA4 Event: contact_submission', { hasConsulting, submissionType });
};

// Page view tracking (optional - GA4 auto-tracks but we can add custom data)
export const trackPageView = (pageName: string, additionalData?: Record<string, any>) => {
  if (!isGtagAvailable()) return;
  
  window.gtag('event', 'page_view', {
    page_title: pageName,
    ...additionalData,
    timestamp: new Date().toISOString()
  });
  
  console.log('GA4 Event: page_view', { pageName, additionalData });
};
