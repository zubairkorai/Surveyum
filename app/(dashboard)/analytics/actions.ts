'use server';

import { createClient } from '@/lib/supabase/server';
import { Question, Choice } from '@/types';

export async function getAnalyticsExportData(surveyId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // 1. Fetch Survey, Questions (with choices), and Responses
    const { data: survey } = await supabase.from('surveys').select('*').eq('id', surveyId).single();
    if (!survey) return null;

    const { data: questions } = await supabase
      .from('questions')
      .select('*, choices(*)')
      .eq('survey_id', surveyId)
      .order('order_index', { ascending: true });

    const { data: responses } = await supabase.from('responses').select('id').eq('survey_id', surveyId);
    const responseIds = responses?.map(r => r.id) || [];

    let answers: any[] = [];
    if (responseIds.length > 0) {
      const { data: answersData } = await supabase.from('answers').select('*').in('response_id', responseIds);
      answers = answersData || [];
    }

    // 2. Compute Aggregated Chart Data (Exact logic from page.tsx)
    const stats = questions?.map(q => {
      const questionAnswers = answers.filter(a => a.question_id === q.id) || [];
      let chartData: { name: string; value: number; percentage: string }[] = [];

      if (['multiple_choice', 'dropdown', 'rating', 'nps', 'likert_scale', 'yes_no'].includes(q.question_type)) {
        const counts: Record<string, number> = {};
        if (q.question_type === 'rating') [1, 2, 3, 4, 5].forEach(n => counts[n] = 0);
        else if (q.question_type === 'nps') [0,1,2,3,4,5,6,7,8,9,10].forEach(n => counts[n] = 0);
        else q.choices?.forEach((c: Choice) => counts[c.label] = 0);

        questionAnswers.forEach(a => {
          if (a.value !== null) {
            const choice = q.choices?.find((c: Choice) => c.value === a.value);
            const key = choice ? choice.label : String(a.value);
            counts[key] = (counts[key] || 0) + 1;
          }
        });
        chartData = Object.entries(counts).map(([name, value]) => ({ 
          name, 
          value,
          percentage: questionAnswers.length > 0 ? ((value / questionAnswers.length) * 100).toFixed(1) + '%' : '0%'
        }));
      } else if (q.question_type === 'checkbox') {
        const counts: Record<string, number> = {};
        q.choices?.forEach((c: Choice) => counts[c.label] = 0);
        questionAnswers.forEach(a => {
          const selected = (a.selected_choices as string[]) || [];
          selected.forEach(val => {
            const choice = q.choices?.find((c: Choice) => c.value === val);
            const key = choice ? choice.label : val;
            counts[key] = (counts[key] || 0) + 1;
          });
        });
        chartData = Object.entries(counts).map(([name, value]) => ({ 
          name, 
          value,
          percentage: questionAnswers.length > 0 ? ((value / questionAnswers.length) * 100).toFixed(1) + '%' : '0%'
        }));
      }

      return {
        question_text: q.question_text,
        question_type: q.question_type,
        answerCount: questionAnswers.length,
        chartData,
        rawAnswers: questionAnswers.map(a => String(a.value || '')).filter(v => v !== ''),
      };
    });

    return { 
      surveyTitle: survey.title, 
      responseCount: responseIds.length, 
      stats: stats || [] 
    };
  } catch (error) {
    console.error('getAnalyticsExportData Error:', error);
    throw error;
  }
}
