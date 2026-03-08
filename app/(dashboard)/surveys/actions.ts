'use server';

import { createClient } from '@/lib/supabase/server';
import { Question, Choice } from '@/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function saveSurvey(data: {
  id?: string;
  title: string;
  description?: string;
  questions: Question[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // 1. Save or Update Survey
  let surveyId = data.id;

  if (surveyId) {
    const { error: surveyError } = await supabase
      .from('surveys')
      .update({
        title: data.title,
        description: data.description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', surveyId)
      .eq('user_id', user.id);

    if (surveyError) throw surveyError;
  } else {
    const { data: newSurvey, error: surveyError } = await supabase
      .from('surveys')
      .insert({
        title: data.title,
        description: data.description,
        user_id: user.id,
      })
      .select()
      .single();

    if (surveyError) throw surveyError;
    surveyId = newSurvey.id;
  }

  // 2. Delete existing questions (Simplest way to sync: clear and re-insert)
  // For production, you might want to perform a more complex diff/merge.
  const { error: deleteError } = await supabase
    .from('questions')
    .delete()
    .eq('survey_id', surveyId);

  if (deleteError) throw deleteError;

  // 3. Insert Questions and Choices
  for (const [qIdx, q] of data.questions.entries()) {
    const { data: newQuestion, error: qError } = await supabase
      .from('questions')
      .insert({
        survey_id: surveyId,
        question_text: q.question_text,
        question_type: q.question_type,
        is_required: q.is_required,
        order_index: qIdx,
        settings: q.settings || {},
      })
      .select()
      .single();

    if (qError) throw qError;

    if (q.choices && q.choices.length > 0) {
      const choicesToInsert = q.choices.map((c, cIdx) => ({
        question_id: newQuestion.id,
        label: c.label,
        value: c.value,
        order_index: cIdx,
      }));

      const { error: cError } = await supabase
        .from('choices')
        .insert(choicesToInsert);

      if (cError) throw cError;
    }
  }

  revalidatePath('/surveys');
  return { success: true, surveyId };
}

export async function deleteSurvey(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('surveys')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;

  revalidatePath('/surveys');
  return { success: true };
}

export async function toggleSurveyPublish(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('surveys')
    .update({ is_published: !currentStatus })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;

  revalidatePath('/surveys');
  return { success: true };
}
