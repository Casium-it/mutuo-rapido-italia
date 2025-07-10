
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FormResponse {
  id: string;
  question_id: string;
  question_text: string;
  block_id: string;
  response_value: any;
  created_at: string;
}

interface SubmissionData {
  id: string;
  form_type: string;
  created_at: string;
  responses: FormResponse[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED' 
      }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Get submission ID from query parameters
    const url = new URL(req.url);
    const submissionId = url.searchParams.get('submissionId');

    if (!submissionId) {
      console.log('Missing submissionId parameter');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'submissionId parameter is required',
          code: 'MISSING_SUBMISSION_ID' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(submissionId)) {
      console.log('Invalid submissionId format:', submissionId);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid submission ID format',
          code: 'INVALID_SUBMISSION_ID' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Looking up submission:', submissionId);

    // First, check if the submission exists
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .select('id, form_type, created_at')
      .eq('id', submissionId)
      .single();

    if (submissionError) {
      console.error('Submission lookup error:', submissionError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Submission not found',
          code: 'SUBMISSION_NOT_FOUND' 
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!submission) {
      console.log('No submission found for ID:', submissionId);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Submission not found',
          code: 'SUBMISSION_NOT_FOUND' 
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Found submission:', submission.id, 'form_type:', submission.form_type);

    // Get all form responses for this submission
    const { data: responses, error: responsesError } = await supabase
      .from('form_responses')
      .select('id, question_id, question_text, block_id, response_value, created_at')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: true });

    if (responsesError) {
      console.error('Responses lookup error:', responsesError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch form responses',
          code: 'RESPONSES_FETCH_ERROR' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Found', responses?.length || 0, 'responses for submission');

    const result: SubmissionData = {
      id: submission.id,
      form_type: submission.form_type,
      created_at: submission.created_at,
      responses: responses || []
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error in shareSubmissionData:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
