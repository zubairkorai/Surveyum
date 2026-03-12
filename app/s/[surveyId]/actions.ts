'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitResponse(surveyId: string, answers: Record<string, unknown>) {
  const supabase = await createClient();
  
  // Safely get user - don't let this fail the whole action
  let userId: string | null = null;
  try {
    const { data: authData } = await supabase.auth.getUser();
    userId = authData?.user?.id || null;
  } catch (e) {
    // Guest user
  }

  try {
    // 1. Create a Response record
    // We MUST be able to select the ID back to save answers
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .insert({
        survey_id: surveyId,
        respondent_id: userId,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (responseError) {
      console.error('Submission Error (Response):', responseError);
      return { success: false, error: `Database Error: ${responseError.message}. Check RLS policies for 'responses' table.` };
    }

    // 2. Prepare Answers
    const answersToInsert = Object.entries(answers).map(([questionId, value]) => {
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
        console.error('Submission Error (Answers):', answersError);
        return { success: false, error: `Failed to save answers: ${answersError.message}. Check RLS for 'answers' table.` };
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}
