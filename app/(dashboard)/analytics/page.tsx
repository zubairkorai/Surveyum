import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { AnalyticsChart } from '@/components/analytics/AnalyticsCharts';
import { Users, CheckCircle, Clock, ChevronLeft, Database, MessageSquare } from 'lucide-react';
import { Question, Choice } from '@/types';
import LinkActual from 'next/link';
import { cn } from '@/lib/utils';

type QuestionWithStats = Question & {
  answerCount: number;
  chartData: { name: string; value: number }[];
  rawAnswers: string[];
};

async function getAnalyticsData(surveyId: string) {
  const supabase = await createClient();

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

  const stats = questions?.map(q => {
    const questionAnswers = answers.filter(a => a.question_id === q.id) || [];
    let chartData: { name: string; value: number }[] = [];

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
      chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));
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
      chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));
    }

    return {
      ...q,
      answerCount: questionAnswers.length,
      chartData,
      rawAnswers: questionAnswers.slice(0, 8).map(a => String(a.value || '')).filter(v => v !== ''),
    } as QuestionWithStats;
  });

  return { survey, responseCount: responseIds.length, questions: (stats || []) as QuestionWithStats[] };
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;

  if (!id) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: surveys } = await supabase
      .from('surveys')
      .select('id, title, created_at')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Analytics</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {surveys?.map((s) => (
            <LinkActual key={s.id} href={`/analytics?id=${s.id}`} className="bg-white dark:bg-gray-800/40 rounded-[1.5rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all flex items-center justify-between group">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">{s.title || 'Untitled Survey'}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Created {new Date(s.created_at).toLocaleDateString()}</p>
              </div>
              <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-blue-500 rotate-180 transition-all" />
            </LinkActual>
          ))}
        </div>
      </div>
    );
  }

  const data = await getAnalyticsData(id);
  if (!data) return notFound();

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <LinkActual href="/analytics" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors">
        <ChevronLeft className="w-3 h-3" />
        Back to Analytics
      </LinkActual>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{data.survey.title}</h1>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Survey Insights</p>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-white dark:bg-gray-800/40 px-5 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-w-[120px]">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Responses</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">{data.responseCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-800/40 px-5 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-w-[120px]">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Status</p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={cn("w-1.5 h-1.5 rounded-full", data.survey.is_published ? "bg-green-500" : "bg-amber-500")} />
              <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase">{data.survey.is_published ? 'Live' : 'Draft'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {data.questions.map((q: QuestionWithStats, idx: number) => (
          <div key={q.id} className="bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700 rounded-[1.5rem] p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <span className="w-8 h-8 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center text-xs font-black text-gray-400 dark:text-gray-500 shrink-0">
                {idx + 1}
              </span>
              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100 leading-snug">
                  {q.question_text}
                </h3>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 block">
                  {q.question_type.replace('_', ' ')}
                </span>
              </div>
            </div>

            {['multiple_choice', 'dropdown', 'rating', 'checkbox', 'nps', 'likert_scale', 'yes_no'].includes(q.question_type) ? (
              <div className="bg-gray-50/30 dark:bg-gray-900/20 rounded-2xl p-4 md:p-6 border border-gray-50 dark:border-gray-800">
                <AnalyticsChart data={q.chartData} type={['checkbox', 'nps'].includes(q.question_type) ? 'bar' : 'pie'} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {q.rawAnswers.length > 0 ? (
                  q.rawAnswers.map((ans: string, i: number) => (
                    <div key={i} className="px-3 py-2 bg-gray-50 dark:bg-gray-900/40 rounded-lg text-[11px] font-medium text-gray-600 dark:text-gray-400 border border-gray-100/50 dark:border-gray-800/50">
                      {ans}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center bg-gray-50/50 dark:bg-gray-900/20 rounded-xl border border-dashed border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest italic">No responses yet</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between text-[9px] text-gray-400 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-green-500" />
                {q.answerCount} entries
              </span>
              <span className="flex items-center gap-1 opacity-60 font-medium">
                <Clock className="w-2.5 h-2.5" />
                Real-time
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
