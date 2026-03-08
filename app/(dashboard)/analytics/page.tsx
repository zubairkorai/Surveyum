import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnalyticsChart } from '@/components/analytics/AnalyticsCharts';
import { BarChart2, Users, CheckCircle, Clock, ChevronLeft } from 'lucide-react';
import { Question, Choice } from '@/types';

type QuestionWithStats = Question & {
  answerCount: number;
  chartData: any[];
  rawAnswers: any[];
};

async function getAnalyticsData(surveyId: string) {
  const supabase = await createClient();

  const { data: survey } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', surveyId)
    .single();

  if (!survey) return null;

  const { data: questions } = await supabase
    .from('questions')
    .select('*, choices(*)')
    .eq('survey_id', surveyId)
    .order('order_index', { ascending: true });

  const { data: responses } = await supabase
    .from('responses')
    .select('*')
    .eq('survey_id', surveyId)
    .eq('status', 'completed');

  const { data: answers } = await supabase
    .from('answers')
    .select('*')
    .in('response_id', responses?.map(r => r.id) || []);

  const stats = questions?.map(q => {
    const questionAnswers = answers?.filter(a => a.question_id === q.id) || [];
    let chartData: any[] = [];

    if (['multiple_choice', 'dropdown', 'rating', 'nps'].includes(q.question_type)) {
      const counts: Record<string, number> = {};
      if (q.question_type === 'rating') [1, 2, 3, 4, 5].forEach(n => counts[n] = 0);
      else if (q.question_type === 'nps') [0,1,2,3,4,5,6,7,8,9,10].forEach(n => counts[n] = 0);
      else q.choices?.forEach((c: Choice) => counts[c.label] = 0);

      questionAnswers.forEach(a => {
        if (a.value !== null) {
          const choice = q.choices?.find((c: Choice) => c.value === a.value);
          const key = choice ? choice.label : a.value;
          counts[key] = (counts[key] || 0) + 1;
        }
      });
      chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));
    } else if (q.question_type === 'checkbox') {
      const counts: Record<string, number> = {};
      q.choices?.forEach((c: Choice) => counts[c.label] = 0);
      questionAnswers.forEach(a => {
        const selected = a.selected_choices as string[] || [];
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
      rawAnswers: questionAnswers.slice(0, 5).map(a => a.value).filter(Boolean),
    } as QuestionWithStats;
  });

  return { survey, responseCount: responses?.length || 0, questions: (stats || []) as QuestionWithStats[] };
}

export default async function AnalyticsPage({ searchParams }: { searchParams: { id?: string } }) {
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
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Select a Survey</h1>
        <div className="grid grid-cols-1 gap-3">
          {surveys?.map((s) => (
            <Link 
              key={s.id} 
              href={`/analytics?id=${s.id}`}
              className="bg-white border border-gray-100 rounded-xl p-5 hover:border-blue-500 transition-all shadow-sm flex items-center justify-between group"
            >
              <div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{s.title || 'Untitled Survey'}</h3>
                <p className="text-[11px] text-gray-400 font-medium mt-1 uppercase tracking-wider">Created {new Date(s.created_at).toLocaleDateString()}</p>
              </div>
              <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-blue-500 rotate-180 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const data = await getAnalyticsData(id);
  if (!data) return notFound();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/analytics" className="flex items-center gap-2 text-[11px] text-gray-400 hover:text-gray-900 mb-8 transition-colors font-bold uppercase tracking-widest">
        <ChevronLeft className="w-3 h-3" />
        Back to list
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">{data.survey.title}</h1>
          <p className="text-xs text-gray-400 mt-1 font-bold uppercase tracking-widest">Analytics Report</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-3 min-w-[140px]">
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Responses</p>
              <p className="text-lg font-black text-gray-900">{data.responseCount}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-3 min-w-[140px]">
            <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Status</p>
              <p className="text-xs font-black text-gray-900">{data.survey.is_published ? 'PUBLISHED' : 'DRAFT'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {data.questions.map((q, idx) => (
          <div key={q.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-3">
                <span className="w-6 h-6 bg-gray-50 rounded-lg flex items-center justify-center text-[10px] font-black text-gray-400">
                  {idx + 1}
                </span>
                {q.question_text}
              </h3>
              <span className="text-[9px] font-black px-2 py-0.5 bg-gray-50 text-gray-400 rounded-md uppercase tracking-wider">
                {q.question_type.replace('_', ' ')}
              </span>
            </div>

            {['multiple_choice', 'dropdown', 'rating', 'checkbox', 'nps'].includes(q.question_type) ? (
              <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-50">
                <AnalyticsChart data={q.chartData} type={['checkbox', 'nps'].includes(q.question_type) ? 'bar' : 'pie'} />
              </div>
            ) : (
              <div className="space-y-2">
                {q.rawAnswers.length > 0 ? (
                  q.rawAnswers.map((ans, i) => (
                    <div key={i} className="p-3.5 bg-gray-50 rounded-xl text-xs font-semibold text-gray-600 border border-gray-100/50">
                      {ans}
                    </div>
                  ))
                ) : (
                  <div className="p-6 bg-gray-50 border border-dashed rounded-xl text-center">
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest italic">No responses yet</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              <span>{q.answerCount} total answers</span>
              <span className="flex items-center gap-1.5 text-blue-500/60">
                <Clock className="w-3 h-3" />
                Updated just now
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
