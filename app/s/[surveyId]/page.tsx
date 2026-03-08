import { createClient } from '@/lib/supabase/server';
import { SurveyResponseForm } from '@/components/SurveyResponseForm';
import { notFound } from 'next/navigation';

export default async function PublicSurveyPage({
  params,
}: {
  params: { surveyId: string };
}) {
  const supabase = await createClient();
  const { surveyId } = await params;

  // Fetch survey
  const { data: survey, error: surveyError } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', surveyId)
    .single();

  if (surveyError || !survey) {
    notFound();
  }

  // Fetch questions and choices
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select(`
      *,
      choices (*)
    `)
    .eq('survey_id', surveyId)
    .order('order_index', { ascending: true });

  if (questionsError) {
    console.error('Error fetching questions:', questionsError);
  }

  // Ensure choices are ordered
  const questionsWithOrderedChoices = questions?.map(q => ({
    ...q,
    choices: q.choices?.sort((a: any, b: any) => a.order_index - b.order_index)
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SurveyResponseForm 
        survey={survey} 
        questions={questionsWithOrderedChoices as any} 
      />
    </div>
  );
}
