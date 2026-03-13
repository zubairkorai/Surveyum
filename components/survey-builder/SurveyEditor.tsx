'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useSurveyBuilder } from '@/hooks/use-survey-builder';
import { SortableQuestion } from './SortableQuestion';
import { QuestionType, Survey, Question, Choice } from '@/types';
import { Type, CheckSquare, List, ChevronDown, Calendar, Star, Save, Eye, Loader2, X, Mail, CheckCircle2, BarChart, Zap, Grid, ArrowUpDown, Sliders, Layout, Image, ListOrdered } from 'lucide-react';
import { saveSurvey } from '@/app/(dashboard)/surveys/actions';
import { toast } from 'sonner';
import { SurveyResponseForm } from '../SurveyResponseForm';
import { cn } from '@/lib/utils';
import { SURVEY_THEMES, ThemeId } from '@/lib/themes';

interface SurveyEditorProps {
  initialSurvey?: Survey;
  initialQuestions?: Question[];
}

export function SurveyEditor({ initialSurvey, initialQuestions }: SurveyEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialSurvey?.title || 'Untitled Survey');
  const [description, setDescription] = useState(initialSurvey?.description || '');
  const [themeId, setThemeId] = useState<ThemeId>((initialSurvey?.theme_id as ThemeId) || 'minimal');
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'questions' | 'themes'>('questions');

  const {
    questions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    moveQuestion,
    addChoice,
    updateChoice,
    removeChoice,
  } = useSurveyBuilder(initialQuestions || []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      moveQuestion(active.id as string, over.id as string);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const result = await saveSurvey({ 
        id: initialSurvey?.id, 
        title, 
        description,
        theme_id: themeId,
        questions 
      });
      if (result.success) {
        toast.success('Survey saved successfully!');
        if (!initialSurvey?.id) router.push(`/surveys/${result.surveyId}/edit`);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save survey');
    } finally {
      setIsSaving(false);
    }
  };

  const questionTypes: { type: QuestionType; label: string; icon: React.ReactNode }[] = [
    { type: 'short_text', label: 'Short', icon: <Type className="w-4 h-4" /> },
    { type: 'long_text', label: 'Long', icon: <Type className="w-4 h-4" /> },
    { type: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { type: 'multiple_choice', label: 'Multi', icon: <List className="w-4 h-4" /> },
    { type: 'checkbox', label: 'Check', icon: <CheckSquare className="w-4 h-4" /> },
    { type: 'dropdown', label: 'Drop', icon: <ChevronDown className="w-4 h-4" /> },
    { type: 'yes_no', label: 'Yes/No', icon: <CheckCircle2 className="w-4 h-4" /> },
    { type: 'rating', label: 'Rate', icon: <Star className="w-4 h-4" /> },
    { type: 'likert_scale', label: 'Scale', icon: <BarChart className="w-4 h-4" /> },
    { type: 'nps', label: 'NPS', icon: <Zap className="w-4 h-4" /> },
    { type: 'matrix', label: 'Matrix', icon: <Grid className="w-4 h-4" /> },
    { type: 'best_worst', label: 'B/W Scale', icon: <ArrowUpDown className="w-4 h-4" /> },
    { type: 'ranking', label: 'Ranking', icon: <ListOrdered className="w-4 h-4" /> },
    { type: 'slider', label: 'Slider', icon: <Sliders className="w-4 h-4" /> },
    { type: 'multiple_textboxes', label: 'Textboxes', icon: <Layout className="w-4 h-4" /> },
    { type: 'image_choice', label: 'Image', icon: <Image className="w-4 h-4" /> },
    { type: 'date', label: 'Date', icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] flex flex-col transition-colors duration-300">
      {/* Editor Header */}
      <header className="bg-white dark:bg-[#111827] border-b dark:border-gray-800 sticky top-0 lg:top-0 z-30 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          <div className="flex flex-col flex-1 min-w-0">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base md:text-xl font-black border-none focus:ring-0 p-0 placeholder:text-gray-400 outline-none text-gray-900 dark:text-gray-100 bg-transparent truncate"
              placeholder="Untitled Survey"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-[10px] md:text-xs font-bold border-none focus:ring-0 p-0 placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none text-gray-500 dark:text-gray-400 bg-transparent truncate"
              placeholder="Add a survey description..."
            />
          </div>
          <span className="hidden sm:inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-lg h-fit">
            {initialSurvey?.is_published ? 'Published' : 'Draft'}
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-3 ml-4">
          <button onClick={() => setIsPreviewOpen(true)} className="p-2 md:px-4 md:py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all">
            <Eye className="w-4 h-4 md:mr-2 md:inline-block" />
            <span className="hidden md:inline">Preview</span>
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 rounded-xl transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin md:mr-2 md:inline-block" /> : <Save className="w-4 h-4 md:mr-2 md:inline-block" />}
            <span className="hidden md:inline">Save</span>
            <span className="md:hidden">Save</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 p-4 md:p-8 pb-32 lg:pb-8">
        {/* Canvas Area */}
        <div className="flex flex-col gap-6">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
            <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-4">
                {questions.length === 0 ? (
                  <div className="h-64 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem] flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 gap-2 bg-white dark:bg-[#111827]/50">
                    <p className="font-bold text-gray-900 dark:text-gray-100">Survey is empty</p>
                    <p className="text-sm font-medium px-6 text-center">Add questions from the toolbox below</p>
                  </div>
                ) : (
                  questions.map((question) => (
                    <SortableQuestion key={question.id} question={question} updateQuestion={updateQuestion} removeQuestion={removeQuestion} addChoice={addChoice} updateChoice={updateChoice} removeChoice={removeChoice} />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Toolbox Sidebar (Desktop) / Bottom Bar (Mobile) */}
        <aside className="fixed bottom-0 left-0 right-0 lg:sticky lg:top-24 lg:bottom-auto bg-white dark:bg-[#111827] lg:bg-transparent border-t lg:border-t-0 dark:border-gray-800 p-4 lg:p-0 z-40 lg:z-auto lg:rounded-[2rem]">
          <div className="bg-white dark:bg-[#111827] lg:border border-gray-100 dark:border-gray-800 lg:rounded-[2rem] lg:p-6 lg:shadow-xl lg:shadow-blue-50/50 dark:lg:shadow-none">
            {/* Tab Switcher */}
            <div className="flex gap-1 p-1 bg-gray-50 dark:bg-gray-900/50 rounded-2xl mb-6">
              <button 
                onClick={() => setActiveTab('questions')}
                className={cn(
                  "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                  activeTab === 'questions' ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                )}
              >
                Questions
              </button>
              <button 
                onClick={() => setActiveTab('themes')}
                className={cn(
                  "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                  activeTab === 'themes' ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                )}
              >
                Themes
              </button>
            </div>

            {activeTab === 'questions' ? (
              <div className="flex lg:grid lg:grid-cols-1 gap-2 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-2 lg:pb-0">
                {questionTypes.map((qt) => (
                  <button
                    key={qt.type}
                    onClick={() => addQuestion(qt.type)}
                    className="flex flex-col lg:flex-row items-center gap-2 lg:gap-3 min-w-[70px] lg:min-w-0 p-2 lg:p-3 text-[10px] lg:text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 rounded-xl lg:rounded-2xl transition-all border border-gray-50 dark:border-gray-800 lg:border-transparent group shrink-0"
                  >
                    <span className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {qt.icon}
                    </span>
                    {qt.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex lg:grid lg:grid-cols-1 gap-3 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-2 lg:pb-0">
                {(Object.values(SURVEY_THEMES)).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setThemeId(t.id)}
                    className={cn(
                      "flex flex-col lg:flex-row items-center gap-3 min-w-[120px] lg:min-w-0 p-3 text-left rounded-2xl transition-all border-2 group shrink-0",
                      themeId === t.id ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-600 dark:border-blue-500 shadow-sm" : "bg-white dark:bg-gray-800/50 border-gray-50 dark:border-gray-800 hover:border-gray-100 dark:hover:border-gray-700"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl shrink-0 border border-black/5 dark:border-white/5", t.colors.background)} />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-black uppercase tracking-tight truncate", themeId === t.id ? "text-blue-700 dark:text-blue-400" : "text-gray-900 dark:text-gray-100")}>{t.name}</p>
                      <p className="hidden lg:block text-[10px] font-medium text-gray-400 dark:text-gray-500 truncate mt-0.5">{t.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0B0F19] md:bg-gray-50 dark:md:bg-[#0f172a] w-full h-full md:max-w-5xl md:h-auto md:max-h-[90vh] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative border-none dark:border dark:border-gray-800">
            <div className="p-4 border-b dark:border-gray-800 bg-white dark:bg-[#0B0F19] flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <h2 className="font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest text-sm">Live Preview</h2>
              </div>
              <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pb-12 custom-scrollbar">
              <SurveyResponseForm
 
                survey={{ id: 'preview', title, theme_id: themeId, description, is_published: false, user_id: '', created_at: '', updated_at: '' }} 
                questions={questions as (Question & { choices: Choice[] })[]} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
