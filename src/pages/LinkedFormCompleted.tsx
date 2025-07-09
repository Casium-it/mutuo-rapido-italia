
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const LinkedFormCompleted = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [completionBehavior, setCompletionBehavior] = useState<string>('funnel');

  useEffect(() => {
    const submissionData = location.state?.submissionData;
    const linkedFormData = location.state?.linkedFormData;
    
    console.log('LinkedFormCompleted loaded:', { submissionData, linkedFormData });

    if (linkedFormData) {
      setCompletionBehavior(linkedFormData.completion_behavior);
      setRedirectUrl(linkedFormData.redirect_url);

      // Send completion webhook
      const sendCompletionWebhook = async () => {
        try {
          await supabase.functions.invoke('webhook-sender', {
            body: {
              link_token: linkedFormData.link_token,
              event_type: 'form_completed',
              data: {
                submission_id: submissionData?.submissionId,
                completion_time: new Date().toISOString()
              }
            }
          });
        } catch (error) {
          console.warn('⚠️ Completion webhook failed:', error);
        }
      };

      sendCompletionWebhook();

      // Handle redirect behavior
      if (linkedFormData.completion_behavior === 'redirect' && linkedFormData.redirect_url) {
        setRedirecting(true);
        setTimeout(() => {
          window.location.href = linkedFormData.redirect_url;
        }, 3000);
      }
    }
  }, [location.state]);

  if (completionBehavior === 'api_only') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-[#245C4F] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#245C4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#245C4F] mb-4">
            Simulazione Completata!
          </h1>
          <p className="text-gray-600 mb-6">
            Grazie per aver completato la simulazione. I tuoi dati sono stati inviati correttamente.
          </p>
          <p className="text-sm text-gray-500">
            Puoi chiudere questa finestra.
          </p>
        </div>
      </div>
    );
  }

  if (completionBehavior === 'redirect') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-[#245C4F] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
            {redirecting ? (
              <div className="w-8 h-8 border-4 border-[#245C4F] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-8 h-8 text-[#245C4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#245C4F] mb-4">
            Simulazione Completata!
          </h1>
          <p className="text-gray-600 mb-6">
            {redirecting 
              ? 'Ti stiamo reindirizzando...' 
              : 'Grazie per aver completato la simulazione.'
            }
          </p>
          {redirecting && redirectUrl && (
            <p className="text-sm text-gray-500">
              Se il redirect non funziona, <a href={redirectUrl} className="text-[#245C4F] hover:underline">clicca qui</a>.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default funnel behavior - redirect to normal completion page
  useEffect(() => {
    navigate('/form-completed', { state: location.state });
  }, [navigate, location.state]);

  return null;
};

export default LinkedFormCompleted;
