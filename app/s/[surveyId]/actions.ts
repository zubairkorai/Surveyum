'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitResponse(surveyId: string, answers: Record<string, any>) {
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
    // Handle array values (like checkboxes)
    const isArray = Array.isArray(value);
    return {
      response_id: response.id,
      question_id: questionId,
      value: isArray ? null : String(value),
      selected_choices: isArray ? value : null,
    };
  });

  const { error: answersError } = await supabase
    .from('answers')
    .insert(answersToInsert);

  if (answersError) throw answersError;

  return { success: true };
}
