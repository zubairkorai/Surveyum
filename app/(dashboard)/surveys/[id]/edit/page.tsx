import { createClient } from '@/lib/supabase/server';
import { SurveyEditor } from '@/components/survey-builder/SurveyEditor';
import { notFound } from 'next/navigation';

export default async function EditSurveyPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch survey
  const { data: survey, error: surveyError } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', id)
    .single();

  if (surveyError || !survey) {
    notFound();
  }

  // Fetch questions and their choices
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select(`
      *,
      choices (*)
    `)
    .eq('survey_id', id)
    .order('order_index', { ascending: true });

  if (questionsError) {
    console.error('Error fetching questions:', questionsError);
  }

  // Ensure choices are also ordered by order_index
  const questionsWithOrderedChoices = questions?.map(q => ({
    ...q,
    choices: q.choices?.sort((a: any, b: any) => a.order_index - b.order_index)
  })) || [];

  return (
    <SurveyEditor 
      initialSurvey={survey} 
      initialQuestions={questionsWithOrderedChoices} 
    />
  );
}
