'use client';

import React, { useState, useMemo } from 'react';
import { Survey, Question, Choice } from '@/types';
import { submitResponse } from '@/app/s/[surveyId]/actions';
import { toast } from 'sonner';
import { Check, Loader2 } from 'lucide-react';
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
        toast.error(`"${q.question_text || 'A required question'}" needs an answer.`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const result = await submitResponse(survey.id, answers);
      if (result.success) {
        setIsSubmitted(true);
        toast.success('Response saved!');
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto mt-32 text-center px-6 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Thank you for your response</h1>
        <p className="text-gray-500 text-sm font-medium">Your feedback has been successfully recorded.</p>
        <div className="mt-10 pt-6 border-t border-gray-100">
          <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-[0.99]">
            Submit another response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-12 md:my-24 px-6 relative bg-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-100 z-[110]">
        <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <div className="mb-12 md:mb-16 border-b border-gray-100 pb-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight leading-tight mb-4">
          {survey.title || 'Untitled Survey'}
        </h1>
        {survey.description && (
          <p className="text-gray-500 text-base leading-relaxed font-medium whitespace-pre-wrap">{survey.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-16 pb-32">
        {questions.map((q, idx) => (
          <div key={q.id} className="animate-in fade-in duration-700" style={{ animationDelay: `${idx * 50}ms` }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-8 flex items-start gap-3">
              <span className="shrink-0 text-gray-300 font-medium">{idx + 1}.</span>
              {q.question_text || 'Untitled Question'}
              {q.is_required && <span className="text-red-500 text-xs ml-1">*</span>}
            </h3>

            {/* Natural Professional Inputs */}
            {['short_text', 'email'].includes(q.question_type) && (
              <input
                type={q.question_type === 'email' ? 'email' : 'text'}
                required={q.is_required}
                className="w-full text-base bg-white border-b-2 border-gray-200 focus:border-blue-600 focus:ring-0 text-gray-900 py-2 outline-none transition-all placeholder:text-gray-300"
                onChange={(e) => handleInputChange(q.id, e.target.value)}
                placeholder={q.question_type === 'email' ? 'email@example.com' : 'Enter your answer'}
              />
            )}

            {q.question_type === 'long_text' && (
              <textarea
                required={q.is_required}
                className="w-full text-base bg-white border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 rounded-xl p-4 min-h-[120px] outline-none transition-all text-gray-900 placeholder:text-gray-300"
                onChange={(e) => handleInputChange(q.id, e.target.value)}
                placeholder="Share your thoughts..."
              />
            )}

            {['multiple_choice', 'yes_no', 'likert_scale'].includes(q.question_type) && (
              <div className={cn("grid grid-cols-1 gap-2.5", q.question_type === 'likert_scale' ? "sm:grid-cols-5" : "")}>
                {q.choices.map((c) => (
                  <label key={c.id} className={cn(
                    "flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 select-none",
                    answers[q.id] === c.value ? "bg-white border-blue-600 shadow-sm" : "bg-white border-gray-100 hover:border-gray-200"
                  )}>
                    <input type="radio" name={q.id} required={q.is_required} className="sr-only" onChange={() => handleInputChange(q.id, c.value)} />
                    <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0", answers[q.id] === c.value ? "border-blue-600" : "border-gray-300")}>
                      {answers[q.id] === c.value && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                    <span className={cn("text-sm font-medium transition-colors", answers[q.id] === c.value ? "text-blue-600" : "text-gray-600")}>{c.label}</span>
                  </label>
                ))}
              </div>
            )}

            {q.question_type === 'checkbox' && (
              <div className="grid grid-cols-1 gap-2.5">
                {q.choices.map((c) => (
                  <label key={c.id} className={cn(
                    "flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 select-none",
                    (answers[q.id] as string[])?.includes(c.value) ? "bg-white border-blue-600 shadow-sm" : "bg-white border-gray-100 hover:border-gray-200"
                  )}>
                    <input type="checkbox" className="sr-only" onChange={(e) => handleCheckboxChange(q.id, c.value, e.target.checked)} />
                    <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0", (answers[q.id] as string[])?.includes(c.value) ? "bg-blue-600 border-blue-600" : "border-gray-300")}>
                      {(answers[q.id] as string[])?.includes(c.value) && <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />}
                    </div>
                    <span className={cn("text-sm font-medium transition-colors", (answers[q.id] as string[])?.includes(c.value) ? "text-blue-600" : "text-gray-600")}>{c.label}</span>
                  </label>
                ))}
              </div>
            )}

            {q.question_type === 'nps' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <label key={num} className="cursor-pointer flex-1 min-w-[35px] max-w-[50px]">
                      <input type="radio" name={q.id} required={q.is_required} className="sr-only" onChange={() => handleInputChange(q.id, num)} />
                      <div className={cn("h-10 md:h-12 flex items-center justify-center rounded-lg border-2 transition-all duration-200 text-sm font-bold", answers[q.id] === num ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300')}>
                        {num}
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
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
                    <div className={cn("w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all duration-200 text-lg font-bold shadow-sm", answers[q.id] === num ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300')}>
                      {num}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {['dropdown', 'date'].includes(q.question_type) && (
              <div className="relative">
                {q.question_type === 'dropdown' ? (
                  <select required={q.is_required} className="w-full bg-white border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 rounded-xl py-3 px-4 outline-none transition-all font-medium text-base cursor-pointer appearance-none shadow-sm" onChange={(e) => handleInputChange(q.id, e.target.value)}>
                    <option value="">Choose an option...</option>
                    {q.choices.map((c) => <option key={c.id} value={c.value}>{c.label}</option>)}
                  </select>
                ) : (
                  <input type="date" required={q.is_required} className="w-full bg-white border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 rounded-xl py-3 px-4 outline-none transition-all font-medium text-base cursor-pointer shadow-sm text-gray-900" onChange={(e) => handleInputChange(q.id, e.target.value)} />
                )}
              </div>
            )}
          </div>
        ))}

        <div className="flex flex-col items-center pt-12">
          <button type="submit" disabled={isSubmitting || survey.id === 'preview'} className={cn("px-10 py-3 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50", survey.id === 'preview' && "cursor-not-allowed")}>
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> Saving...</> : <>{survey.id === 'preview' ? 'Preview Mode' : 'Submit response'}</>}
          </button>
          <div className="mt-8 flex items-center gap-4 border-t border-gray-50 pt-8 w-full justify-center">
            <button type="button" onClick={() => setAnswers({})} className="text-[10px] font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest">Reset Form</button>
            <div className="w-1 h-1 rounded-full bg-gray-200" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Surveyum Secure</p>
          </div>
        </div>
      </form>
    </div>
  );
}
