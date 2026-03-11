'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitResponse(surveyId: string, answers: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  if (responseError) throw responseError;

  // 2. Insert Answers
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

  const { error: answersError } = await supabase
    .from('answers')
    .insert(answersToInsert);

  if (answersError) throw answersError;

  return { success: true };
}
