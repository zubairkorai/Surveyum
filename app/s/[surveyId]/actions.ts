'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitResponse(surveyId: string, answers: Record<string, unknown>) {
  const supabase = await createClient();
  
  // Get user session safely without throwing if not logged in
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  try {
    // 1. Create a Response record
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .insert({
        survey_id: surveyId,
        respondent_id: user?.id || null,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (responseError) {
      console.error('Response insert error:', responseError);
      throw new Error('Failed to create response record');
    }

    // 2. Prepare Answers for insertion
    const answersToInsert = Object.entries(answers).map(([questionId, value]) => {
      // Handle complex values (arrays or objects)
      const isComplex = typeof value === 'object' && value !== null;
      return {
        response_id: response.id,
        question_id: questionId,
        value: isComplex ? null : String(value),
        selected_choices: isComplex ? value : null,
      };
    });

    if (answersToInsert.length > 0) {
      const { error: answersError } = await supabase
        .from('answers')
        .insert(answersToInsert);

      if (answersError) {
        console.error('Answers insert error:', answersError);
        throw new Error('Failed to save survey answers');
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Submission error details:', error);
    return { 
      success: false, 
      error: error.message || 'An unexpected error occurred during submission' 
    };
  }
}
