'use client';

import React, { useState, useMemo } from 'react';
import { Survey, Question, Choice } from '@/types';
import { submitResponse } from '@/app/s/[surveyId]/actions';
import { toast } from 'sonner';
import { Check, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SURVEY_THEMES, ThemeId } from '@/lib/themes';

interface SurveyResponseFormProps {
  survey: Survey;
  questions: (Question & { choices: Choice[] })[];
}

type AnswerValue = string | number | string[] | any;

export function SurveyResponseForm({ survey, questions }: SurveyResponseFormProps) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get theme configuration
  const theme = SURVEY_THEMES[(survey.theme_id as ThemeId) || 'minimal'];

  const progress = useMemo(() => {
    if (questions.length === 0) return 0;
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / questions.length) * 100);
  }, [answers, questions.length]);

  const handleInputChange = (questionId: string, value: AnswerValue) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleMatrixChange = (questionId: string, row: string, columnValue: string) => {
    setAnswers(prev => {
      const current = (prev[questionId] as Record<string, string>) || {};
      return { ...prev, [questionId]: { ...current, [row]: columnValue } };
    });
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
      } else {
        toast.error(result.error || 'Failed to submit. Please try again.');
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={cn("flex-1 flex items-center justify-center p-6 md:p-12 transition-colors duration-500", theme.colors.background, theme.styles.fontFamily)}>
        <div className={cn("max-w-lg w-full p-12 text-center shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-700", theme.colors.card, theme.styles.cardRadius)}>
          <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 transition-transform hover:rotate-0", theme.colors.primary, "bg-opacity-10", theme.colors.accent.replace('text-', 'text-'))}>
            <Check className="w-10 h-10" strokeWidth={3} />
          </div>
          <h1 className={cn("text-3xl font-bold mb-3 tracking-tight", theme.colors.text)}>Submission Received</h1>
          <p className={cn("text-lg font-medium leading-relaxed mb-10", theme.colors.muted)}>
            Thank you for your valuable feedback. Your responses have been securely recorded.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.location.reload()} 
              className={cn("w-full px-8 py-4 text-white text-base font-bold transition-all shadow-lg active:scale-[0.98]", theme.colors.primary, theme.styles.buttonRadius)}
            >
              Submit another response
            </button>
            <p className="text-xs text-gray-400 mt-4 font-medium uppercase tracking-widest">Powered by Surveyum</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 flex flex-col items-center transition-colors duration-500", theme.colors.background, theme.styles.fontFamily)}>
      {/* Fixed Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-black/5 z-[100] overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]", theme.colors.primary)} 
          style={{ width: `${progress}%` }} 
        />
      </div>

      <div className="w-full max-w-[800px] px-4 md:px-8 py-12 md:py-24">
        {/* Survey Header Card */}
        <div className={cn("p-8 md:p-12 shadow-sm border border-black/5 mb-12 animate-in fade-in duration-700", theme.colors.card, theme.styles.cardRadius)}>
          <div className={cn("flex items-center gap-2 mb-6", theme.colors.accent)}>
            <Sparkles className="w-5 h-5 fill-current" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Official Survey</span>
          </div>
          <h1 className={cn("text-4xl md:text-5xl font-black tracking-tight leading-[1.1] mb-6", theme.colors.text)}>
            {survey.title || 'Untitled Survey'}
          </h1>
          {survey.description && (
            <p className={cn("text-lg leading-relaxed font-medium whitespace-pre-wrap", theme.colors.muted)}>{survey.description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, idx) => (
            <div 
              key={q.id} 
              className={cn("p-8 md:p-10 shadow-sm border border-black/5 animate-in fade-in duration-700 slide-in-from-bottom-4", theme.colors.card, theme.styles.cardRadius)} 
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-start gap-4 mb-8">
                <span className={cn("flex items-center justify-center w-8 h-8 rounded-xl bg-black/5 text-sm font-bold shrink-0", theme.colors.muted)}>
                  {idx + 1}
                </span>
                <h3 className={cn("text-xl md:text-2xl font-bold tracking-tight pt-0.5 leading-snug", theme.colors.text)}>
                  {q.question_text || 'Untitled Question'}
                  {q.is_required && <span className={cn("ml-2", theme.colors.accent)} title="Required">*</span>}
                </h3>
              </div>

              {/* Enhanced Inputs with Theme Styles */}
              <div className="px-0 sm:px-12">
                {['short_text', 'email'].includes(q.question_type) && (
                  <input
                    type={q.question_type === 'email' ? 'email' : 'text'}
                    required={q.is_required}
                    className={cn(
                      "w-full text-xl bg-transparent border-b-2 focus:ring-0 py-3 outline-none transition-all font-medium",
                      theme.colors.text,
                      theme.styles.inputStyle
                    )}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    placeholder={q.question_type === 'email' ? 'name@example.com' : 'Type your answer here...'}
                  />
                )}

                {q.question_type === 'long_text' && (
                  <textarea
                    required={q.is_required}
                    className={cn(
                      "w-full text-lg border-2 focus:ring-4 focus:ring-opacity-10 rounded-2xl p-6 min-h-[160px] outline-none transition-all font-medium leading-relaxed",
                      theme.styles.inputStyle,
                      theme.colors.text
                    )}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    placeholder="Tell us more about it..."
                  />
                )}

                {['multiple_choice', 'yes_no', 'likert_scale'].includes(q.question_type) && (
                  <div className={cn(
                    "grid gap-3", 
                    q.question_type === 'likert_scale' ? "grid-cols-1 sm:grid-cols-5" : "grid-cols-1"
                  )}>
                    {q.choices.map((c) => (
                      <label key={c.id} className={cn(
                        "flex items-center gap-4 cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 group select-none h-full",
                        q.question_type === 'likert_scale' && "sm:flex-col sm:justify-center sm:text-center sm:gap-3 sm:p-4",
                        answers[q.id] === c.value 
                          ? cn("bg-opacity-10 border-current shadow-sm", theme.colors.accent.replace('text-', 'bg-'), theme.colors.accent)
                          : cn("bg-white/50 dark:bg-gray-800/50 border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20", theme.colors.text)
                      )}>
                        <input type="radio" name={q.id} required={q.is_required} className="sr-only" onChange={() => handleInputChange(q.id, c.value)} />
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0", 
                          answers[q.id] === c.value ? "border-current bg-current" : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500"
                        )}>
                          {answers[q.id] === c.value && <div className="w-2 h-2 rounded-full bg-white dark:bg-gray-900" />}
                        </div>
                        <span className={cn(
                          "font-bold transition-colors leading-tight",
                          q.question_type === 'likert_scale' ? "text-[10px] sm:text-xs uppercase tracking-wider" : "text-base"
                        )}>
                          {c.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {q.question_type === 'checkbox' && (
                  <div className="grid grid-cols-1 gap-3">
                    {q.choices.map((c) => (
                      <label key={c.id} className={cn(
                        "flex items-center gap-4 cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 group select-none",
                        (answers[q.id] as string[])?.includes(c.value)
                          ? cn("bg-opacity-10 border-current shadow-sm", theme.colors.accent.replace('text-', 'bg-'), theme.colors.accent)
                          : cn("bg-white/50 dark:bg-gray-800/50 border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20", theme.colors.text)
                      )}>
                        <input type="checkbox" className="sr-only" onChange={(e) => handleCheckboxChange(q.id, c.value, e.target.checked)} />
                        <div className={cn("w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0", 
                          (answers[q.id] as string[])?.includes(c.value) ? "border-current bg-current" : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500"
                        )}>
                          {(answers[q.id] as string[])?.includes(c.value) && <Check className="w-4 h-4 text-white dark:text-gray-900" strokeWidth={4} />}
                        </div>
                        <span className="text-base font-bold">{c.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.question_type === 'nps' && (
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap gap-2">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <label key={num} className="cursor-pointer flex-1 min-w-[40px]">
                          <input type="radio" name={q.id} required={q.is_required} className="sr-only" onChange={() => handleInputChange(q.id, num)} />
                          <div className={cn("h-14 flex items-center justify-center rounded-xl border-2 transition-all duration-300 text-lg font-black", 
                            answers[q.id] === num 
                              ? cn("text-white shadow-lg scale-105", theme.colors.primary) 
                              : "bg-white/50 border-black/5 text-gray-400 hover:border-black/20"
                          )}>
                            {num}
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                      <span>Not likely</span>
                      <span>Extremely likely</span>
                    </div>
                  </div>
                )}

                {q.question_type === 'rating' && (
                  <div className="flex flex-wrap items-center gap-4">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <label key={num} className="cursor-pointer">
                        <input type="radio" name={q.id} required={q.is_required} className="sr-only" onChange={() => handleInputChange(q.id, num)} />
                        <div className={cn("w-16 h-16 flex items-center justify-center rounded-[20px] border-2 transition-all duration-300 text-2xl font-black shadow-sm", 
                          answers[q.id] === num 
                            ? cn("text-white shadow-xl scale-110", theme.colors.primary) 
                            : "bg-white/50 border-black/5 text-gray-400 hover:border-black/20"
                        )}>
                          {num}
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {q.question_type === 'image_choice' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {q.choices.map((c) => (
                      <label key={c.id} className={cn(
                        "relative flex flex-col cursor-pointer rounded-3xl border-2 transition-all duration-300 overflow-hidden group shadow-sm",
                        answers[q.id] === c.value ? "border-current shadow-xl scale-[1.02]" : "border-black/5 hover:border-black/10",
                        theme.colors.accent
                      )}>
                        <input type="radio" name={q.id} required={q.is_required} className="sr-only" onChange={() => handleInputChange(q.id, c.value)} />
                        <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                          {c.image_url ? (
                            <img src={c.image_url} alt={c.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="flex flex-col items-center gap-3 text-gray-200 h-full justify-center">
                              <ImageIcon className="w-12 h-12" strokeWidth={1} />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em]">No Preview</span>
                            </div>
                          )}
                          {answers[q.id] === c.value && (
                            <div className="absolute inset-0 bg-current bg-opacity-10 flex items-center justify-center animate-in fade-in">
                              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                                <Check className="w-6 h-6" strokeWidth={4} />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className={cn("p-6 border-t border-black/5", theme.colors.card)}>
                          <span className={cn("text-base font-black tracking-tight transition-colors", 
                            answers[q.id] === c.value ? "text-current" : theme.colors.text
                          )}>
                            {c.label || 'Untitled Option'}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {['dropdown', 'date'].includes(q.question_type) && (
                  <div className="relative">
                    {q.question_type === 'dropdown' ? (
                      <select required={q.is_required} className={cn(
                        "w-full border-2 focus:ring-4 focus:ring-opacity-10 rounded-2xl py-4 px-6 outline-none transition-all font-bold text-lg cursor-pointer appearance-none shadow-sm",
                        theme.styles.inputStyle,
                        theme.colors.text
                      )} onChange={(e) => handleInputChange(q.id, e.target.value)}>
                        <option value="">Choose an option...</option>
                        {q.choices.map((c) => <option key={c.id} value={c.value}>{c.label}</option>)}
                      </select>
                    ) : (
                      <input type="date" required={q.is_required} className={cn(
                        "w-full border-2 focus:ring-4 focus:ring-opacity-10 rounded-2xl py-4 px-6 outline-none transition-all font-bold text-lg cursor-pointer shadow-sm",
                        theme.styles.inputStyle,
                        theme.colors.text
                      )} onChange={(e) => handleInputChange(q.id, e.target.value)} />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Form Actions */}
          <div className="pt-12 pb-24 flex flex-col items-center gap-8">
            <button 
              type="submit" 
              disabled={isSubmitting || survey.id === 'preview'} 
              className={cn(
                "w-full sm:w-auto px-12 py-5 text-white text-lg font-black transition-all shadow-2xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center min-w-[280px]", 
                theme.colors.primary,
                theme.styles.buttonRadius,
                survey.id === 'preview' && "cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-3" /> Sending...</>
              ) : (
                <>{survey.id === 'preview' ? 'Preview Mode Only' : 'Submit Survey'}</>
              )}
            </button>
            <div className="flex items-center gap-6 opacity-40 hover:opacity-100 transition-opacity">
              <button type="button" onClick={() => setAnswers({})} className={cn("text-[10px] font-black uppercase tracking-[0.2em] hover:text-current transition-colors", theme.colors.text)}>Reset Form</button>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", theme.colors.text)}>Secure Encryption</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
