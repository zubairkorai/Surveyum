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
import { Type, CheckSquare, List, ChevronDown, Calendar, Star, Save, Eye, Loader2, X, Mail, CheckCircle2, BarChart, Zap } from 'lucide-react';
import { saveSurvey } from '@/app/(dashboard)/surveys/actions';
import { toast } from 'sonner';
import { SurveyResponseForm } from '../SurveyResponseForm';
import { cn } from '@/lib/utils';

interface SurveyEditorProps {
  initialSurvey?: Survey;
  initialQuestions?: Question[];
}

export function SurveyEditor({ initialSurvey, initialQuestions }: SurveyEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialSurvey?.title || 'Untitled Survey');
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
      const result = await saveSurvey({ id: initialSurvey?.id, title, questions });
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
    { type: 'date', label: 'Date', icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Editor Header */}
      <header className="bg-white border-b sticky top-0 lg:top-0 z-30 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-base md:text-xl font-black border-none focus:ring-0 p-0 placeholder:text-gray-400 outline-none text-gray-900 bg-transparent truncate flex-1"
            placeholder="Untitled Survey"
          />
          <span className="hidden sm:inline-block px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg">
            {initialSurvey?.is_published ? 'Published' : 'Draft'}
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-3 ml-4">
          <button onClick={() => setIsPreviewOpen(true)} className="p-2 md:px-4 md:py-2 text-sm font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
            <Eye className="w-4 h-4 md:mr-2 md:inline-block" />
            <span className="hidden md:inline">Preview</span>
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 rounded-xl transition-all shadow-lg shadow-blue-200">
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
                  <div className="h-64 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center text-gray-400 gap-2 bg-white">
                    <p className="font-bold text-gray-900">Survey is empty</p>
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
        <aside className="fixed bottom-0 left-0 right-0 lg:sticky lg:top-24 lg:bottom-auto bg-white lg:bg-transparent border-t lg:border-t-0 p-4 lg:p-0 z-40 lg:z-auto">
          <div className="bg-white lg:border border-gray-100 lg:rounded-[2rem] lg:p-6 lg:shadow-xl lg:shadow-blue-50/50">
            <h3 className="hidden lg:block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Toolbox</h3>
            <div className="flex lg:grid lg:grid-cols-1 gap-2 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-2 lg:pb-0">
              {questionTypes.map((qt) => (
                <button
                  key={qt.type}
                  onClick={() => addQuestion(qt.type)}
                  className="flex flex-col lg:flex-row items-center gap-2 lg:gap-3 min-w-[70px] lg:min-w-0 p-2 lg:p-3 text-[10px] lg:text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl lg:rounded-2xl transition-all border border-gray-50 lg:border-transparent group shrink-0"
                >
                  <span className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-100 transition-colors text-gray-400 group-hover:text-blue-600">
                    {qt.icon}
                  </span>
                  {qt.label}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white md:bg-gray-50 w-full h-full md:max-w-5xl md:h-auto md:max-h-[90vh] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative">
            <div className="p-4 border-b bg-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <h2 className="font-black text-gray-900 uppercase tracking-widest text-sm">Live Preview</h2>
              </div>
              <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-900">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pb-12">
              <SurveyResponseForm 
                survey={{ id: 'preview', title, description: '', is_published: false, user_id: '', created_at: '', updated_at: '' }} 
                questions={questions as (Question & { choices: Choice[] })[]} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
