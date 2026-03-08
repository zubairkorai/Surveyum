import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Plus, LayoutDashboard, Calendar, BarChart2, Zap, ArrowRight } from 'lucide-react';
import { SurveyCardMenu } from '@/components/SurveyCardMenu';

export default async function SurveysPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: surveys, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching surveys:', error);
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 md:mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">My Surveys</h1>
          <p className="text-gray-500 font-medium mt-1 text-sm md:text-base">Manage and track your active campaigns.</p>
        </div>
        <Link
          href="/surveys/new"
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 text-sm md:text-base"
        >
          <Plus className="w-5 h-5" />
          Create New Survey
        </Link>
      </div>

      {!surveys || surveys.length === 0 ? (
        <div className="bg-white border-2 border-dashed rounded-[2rem] md:rounded-[2.5rem] p-10 md:p-20 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 text-blue-600 rounded-2xl md:rounded-3xl flex items-center justify-center mb-6">
            <LayoutDashboard className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">No surveys yet</h3>
          <p className="text-gray-500 max-w-xs mb-8 font-medium text-sm md:text-base">Build your first survey and start collecting powerful insights in minutes.</p>
          <Link
            href="/surveys/new"
            className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all text-sm"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {surveys.map((survey) => (
            <div key={survey.id} className="bg-white border border-gray-100 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 hover:border-blue-300 transition-all shadow-sm hover:shadow-xl hover:shadow-blue-100/30 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start justify-between mb-4 md:mb-6">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-lg md:text-xl font-black text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {survey.title || 'Untitled Survey'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 md:mt-3">
                    <span className={survey.is_published ? 
                      "flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-md" : 
                      "flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-md"
                    }>
                      <Zap className="w-2.5 h-2.5" />
                      {survey.is_published ? 'Published' : 'Draft'}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      <Calendar className="w-2.5 h-2.5" />
                      {new Date(survey.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <SurveyCardMenu surveyId={survey.id} isPublished={survey.is_published} />
              </div>

              <div className="flex items-center gap-2 md:gap-3 mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-50">
                <Link
                  href={`/surveys/${survey.id}/edit`}
                  className="flex-1 text-center py-2.5 md:py-3 text-xs md:text-sm font-black text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all active:scale-95"
                >
                  Edit
                </Link>
                <Link
                  href={`/analytics?id=${survey.id}`}
                  className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  <BarChart2 className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
