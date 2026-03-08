'use client';

import React, { useState, useMemo } from 'react';
import { Survey, Question, Choice } from '@/types';
import { submitResponse } from '@/app/s/[surveyId]/actions';
import { toast } from 'sonner';
import { Check, Loader2, Mail, Calendar, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SurveyResponseFormProps {
  survey: Survey;
  questions: (Question & { choices: Choice[] })[];
}

type AnswerValue = string | number | string[] | null;

export function SurveyResponseForm({ survey, questions }: SurveyResponseFormProps) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const progress = useMemo(() => {
    if (questions.length === 0) return 0;
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / questions.length) * 100);
  }, [answers, questions.length]);

  const handleInputChange = (questionId: string, value: AnswerValue) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId: string, choiceValue: string, checked: boolean) => {
    setAnswers(prev => {
      const currentValues = (prev[questionId] as string[]) || [];
      if (checked) return { ...prev, [questionId]: [...currentValues, choiceValue] };
      else return { ...prev, [questionId]: currentValues.filter((v: string) => v !== choiceValue) };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (survey.id === 'preview') {
      toast.info("Survey submitted successfully! (Preview Mode)");
      return;
    }

    for (const q of questions) {
      if (q.is_required && !answers[q.id] && answers[q.id] !== 0) {
        toast.error(`"${q.question_text || 'This field'}" is required.`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const result = await submitResponse(survey.id, answers);
      if (result.success) {
        setIsSubmitted(true);
        toast.success('Thank you for your response!');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center px-6 animate-in fade-in zoom-in duration-500">
        <div className="bg-white border border-gray-100 rounded-3xl p-12 shadow-xl shadow-blue-100/20 relative overflow-hidden">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8" strokeWidth={3} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Response Recorded</h1>
          <p className="text-gray-500 text-sm font-medium leading-relaxed">Thank you for participating in this survey.</p>
          <div className="mt-10 pt-6 border-t border-gray-50 flex flex-col items-center gap-4">
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95 shadow-lg">
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-12 px-6 relative">
      {/* Brand Header */}
      <div className="flex justify-center mb-8 animate-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-100">
          <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center text-white text-[8px] font-black">S</div>
          <span className="text-[10px] font-black text-gray-900 tracking-widest uppercase">Surveyum</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-100 z-[110]">
        <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-xl shadow-blue-100/20 mb-8 relative overflow-hidden animate-in fade-in duration-700">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600" />
        <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight leading-tight">
          {survey.title || 'Untitled Survey'}
        </h1>
        {survey.description && (
          <p className="text-gray-500 text-sm leading-relaxed font-medium whitespace-pre-wrap">{survey.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-24">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm group transition-all duration-300 hover:shadow-md hover:border-blue-100/50 animate-in slide-in-from-bottom-4 fade-in duration-700" style={{ animationDelay: `${idx * 50}ms` }}>
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-start gap-3 leading-snug">
              <span className="shrink-0 w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:text-blue-600 transition-colors">
                {idx + 1}
              </span>
              {q.question_text || 'New Question'}
              {q.is_required && <span className="text-red-500 ml-1 text-xs">*</span>}
            </h3>

            {/* Text Inputs */}
            {['short_text', 'email'].includes(q.question_type) && (
              <input
                type={q.question_type === 'email' ? 'email' : 'text'}
                required={q.is_required}
                className="w-full text-lg font-bold bg-transparent border-b-2 border-gray-100 focus:border-blue-600 focus:ring-0 text-gray-900 py-3 outline-none transition-all placeholder:text-gray-100"
                onChange={(e) => handleInputChange(q.id, e.target.value)}
                placeholder={q.question_type === 'email' ? 'name@company.com' : 'Your answer...'}
              />
            )}

            {q.question_type === 'long_text' && (
              <textarea
                required={q.is_required}
                className="w-full text-base font-bold bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl p-4 min-h-[120px] outline-none transition-all text-gray-900 placeholder:text-gray-200"
                onChange={(e) => handleInputChange(q.id, e.target.value)}
                placeholder="Type your detailed response..."
              />
            )}

            {/* Choice-based inputs */}
            {['multiple_choice', 'yes_no', 'likert_scale'].includes(q.question_type) && (
              <div className={cn("grid grid-cols-1 gap-3", q.question_type === 'likert_scale' ? "sm:grid-cols-5" : "")}>
                {q.choices.map((c) => (
                  <label key={c.id} className={cn(
                    "flex items-center gap-3 cursor-pointer group/label p-4 rounded-xl border-2 transition-all duration-200 select-none",
                    answers[q.id] === c.value ? "bg-blue-600 border-blue-600 shadow-md shadow-blue-100" : "bg-white border-gray-50 hover:border-blue-100 hover:bg-blue-50/20"
                  )}>
                    <input type="radio" name={q.id} required={q.is_required} className="sr-only" onChange={() => handleInputChange(q.id, c.value)} />
                    <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center transition-all", answers[q.id] === c.value ? "bg-white border-white" : "bg-white border-gray-200 group-hover/label:border-blue-400")}>
                      {answers[q.id] === c.value && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                    </div>
                    <span className={cn("text-sm font-bold leading-none", answers[q.id] === c.value ? "text-white" : "text-gray-600 group-hover/label:text-gray-900")}>{c.label}</span>
                  </label>
                ))}
              </div>
            )}

            {q.question_type === 'checkbox' && (
              <div className="grid grid-cols-1 gap-3">
                {q.choices.map((c) => (
                  <label key={c.id} className={cn(
                    "flex items-center gap-3 cursor-pointer group/label p-4 rounded-xl border-2 transition-all duration-200 select-none",
                    (answers[q.id] as string[])?.includes(c.value) ? "bg-blue-600 border-blue-600 shadow-md shadow-blue-100" : "bg-white border-gray-50 hover:border-blue-100 hover:bg-blue-50/20"
                  )}>
                    <input type="checkbox" className="sr-only" onChange={(e) => handleCheckboxChange(q.id, c.value, e.target.checked)} />
                    <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-all", (answers[q.id] as string[])?.includes(c.value) ? "bg-white border-white" : "bg-white border-gray-200 group-hover/label:border-blue-400")}>
                      {(answers[q.id] as string[])?.includes(c.value) && <Check className="w-3 h-3 text-blue-600" strokeWidth={4} />}
                    </div>
                    <span className={cn("text-sm font-bold leading-none", (answers[q.id] as string[])?.includes(c.value) ? "text-white" : "text-gray-600 group-hover/label:text-gray-900")}>{c.label}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Scale-based inputs */}
            {q.question_type === 'nps' && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-11 gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <label key={num} className="cursor-pointer">
                      <input type="radio" name={q.id} required={q.is_required} className="sr-only" onChange={() => handleInputChange(q.id, num)} />
                      <div className={cn("h-10 sm:h-12 flex items-center justify-center rounded-lg border-2 transition-all duration-200 font-bold text-xs sm:text-sm", answers[q.id] === num ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-50 text-gray-300 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/30')}>
                        {num}
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">
                  <span>Not likely</span>
                  <span>Extremely likely</span>
                </div>
              </div>
            )}

            {q.question_type === 'rating' && (
              <div className="flex flex-wrap items-center gap-3">
                {[1, 2, 3, 4, 5].map((num) => (
                  <label key={num} className="cursor-pointer">
                    <input type="radio" name={q.id} required={q.is_required} className="sr-only" onChange={() => handleInputChange(q.id, num)} />
                    <div className={cn("w-12 h-12 flex items-center justify-center rounded-2xl border-2 transition-all duration-200 font-black text-lg shadow-sm", answers[q.id] === num ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-50 text-gray-300 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/30')}>
                      {num}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {['dropdown', 'date'].includes(q.question_type) && (
              <div className="relative group/select">
                {q.question_type === 'dropdown' ? (
                  <select required={q.is_required} className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white text-gray-900 py-4 px-6 rounded-2xl outline-none transition-all font-bold text-lg cursor-pointer appearance-none shadow-sm" onChange={(e) => handleInputChange(q.id, e.target.value)}>
                    <option value="">Choose an option...</option>
                    {q.choices.map((c) => <option key={c.id} value={c.value}>{c.label}</option>)}
                  </select>
                ) : (
                  <input type="date" required={q.is_required} className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white text-gray-900 py-4 px-6 rounded-2xl outline-none transition-all font-bold text-lg cursor-pointer shadow-sm" onChange={(e) => handleInputChange(q.id, e.target.value)} />
                )}
              </div>
            )}
          </div>
        ))}

        <div className="flex flex-col items-center gap-6 pt-8">
          <button type="submit" disabled={isSubmitting || survey.id === 'preview'} className={cn("flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl active:scale-95", survey.id === 'preview' ? "bg-amber-100 text-amber-700 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200")}>
            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : <>{survey.id === 'preview' ? 'Preview Mode' : 'Submit Response'}<Check className="w-5 h-5" strokeWidth={3} /></>}
          </button>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setAnswers({})} className="text-[9px] font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-[0.2em]">Clear Form</button>
            <div className="w-1 h-1 rounded-full bg-gray-200" />
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Surveyum Secure</p>
          </div>
        </div>
      </form>
    </div>
  );
}
