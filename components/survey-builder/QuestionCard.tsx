'use client';

import React from 'react';
import { Question, Choice } from '@/types';
import { Trash2, Plus, GripVertical, CheckSquare, Type, List, ChevronDown, Calendar, Star, Mail, CheckCircle2, BarChart, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  removeQuestion: (id: string) => void;
  addChoice: (questionId: string) => void;
  updateChoice: (questionId: string, choiceId: string, label: string) => void;
  removeChoice: (questionId: string, choiceId: string) => void;
  dragHandleProps?: any;
}

export function QuestionCard({
  question,
  updateQuestion,
  removeQuestion,
  addChoice,
  updateChoice,
  removeChoice,
  dragHandleProps,
}: QuestionCardProps) {
  const getIcon = () => {
    switch (question.question_type) {
      case 'short_text': return <Type className="w-4 h-4" />;
      case 'long_text': return <Type className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'multiple_choice': return <List className="w-4 h-4" />;
      case 'checkbox': return <CheckSquare className="w-4 h-4" />;
      case 'dropdown': return <ChevronDown className="w-4 h-4" />;
      case 'yes_no': return <CheckCircle2 className="w-4 h-4" />;
      case 'rating': return <Star className="w-4 h-4" />;
      case 'likert_scale': return <BarChart className="w-4 h-4" />;
      case 'nps': return <Zap className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      default: return <Type className="w-4 h-4" />;
    }
  };

  const isChoiceBased = ['multiple_choice', 'checkbox', 'dropdown', 'likert_scale', 'yes_no'].includes(question.question_type);

  return (
    <div className="bg-white border rounded-3xl p-8 shadow-sm group relative hover:border-blue-300 transition-all">
      {/* Drag Handle */}
      <div 
        {...dragHandleProps} 
        className="absolute left-3 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-blue-500 transition-colors"
      >
        <GripVertical className="w-6 h-6" />
      </div>

      <div className="flex flex-col gap-6 ml-6">
        {/* Header: Type and Required Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <span className="p-1.5 bg-gray-50 rounded-lg text-gray-400">
              {getIcon()}
            </span>
            {question.question_type.replace('_', ' ')}
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={question.is_required}
                onChange={(e) => updateQuestion(question.id, { is_required: e.target.checked })}
                className="w-4 h-4 rounded-md border-gray-200 text-blue-600 focus:ring-blue-500"
              />
              Required
            </label>
            <button
              onClick={() => removeQuestion(question.id)}
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Question Text */}
        <div className="relative group/input">
          <input
            type="text"
            value={question.question_text}
            onChange={(e) => updateQuestion(question.id, { question_text: e.target.value })}
            placeholder="Write your question here..."
            className={cn(
              "text-xl font-bold border-none focus:ring-0 w-full p-0 bg-transparent outline-none transition-all",
              question.question_text === '' ? "text-gray-300" : "text-gray-900"
            )}
          />
          <div className="absolute bottom-[-4px] left-0 w-full h-0.5 bg-gray-50 group-focus-within/input:bg-blue-600 transition-colors" />
        </div>

        {/* Choices (if applicable) */}
        {isChoiceBased && (
          <div className="flex flex-col gap-3 mt-2">
            {question.choices?.map((choice, idx) => (
              <div key={choice.id} className="flex items-center gap-3 group/choice">
                <div className={cn(
                  "w-5 h-5 border-2 border-gray-100 shrink-0",
                  question.question_type === 'checkbox' ? "rounded-md" : "rounded-full"
                )} />
                <input
                  type="text"
                  value={choice.label}
                  onChange={(e) => updateChoice(question.id, choice.id, e.target.value)}
                  className={cn(
                    "flex-1 text-sm font-semibold border-none focus:ring-0 p-1.5 outline-none rounded-lg transition-all",
                    choice.label === '' ? "text-gray-300 italic" : "text-gray-700 bg-gray-50"
                  )}
                  placeholder={
                    question.question_type === 'yes_no' ? (idx === 0 ? "Yes" : "No") : 
                    question.question_type === 'likert_scale' ? `Scale Point ${idx + 1}` :
                    `Option ${idx + 1}`
                  }
                />
                {/* Don't allow deleting Yes/No choices to keep it simple */}
                {question.question_type !== 'yes_no' && (
                  <button
                    onClick={() => removeChoice(question.id, choice.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover/choice:opacity-100 transition-all hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            
            {!['yes_no', 'likert_scale'].includes(question.question_type) && (
              <button
                onClick={() => addChoice(question.id)}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 mt-4 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Option
              </button>
            )}
          </div>
        )}

        {/* NPS Visual */}
        {question.question_type === 'nps' && (
          <div className="mt-4">
            <div className="flex gap-1 mb-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <div key={i} className="flex-1 h-10 border-2 border-gray-100 rounded-lg flex items-center justify-center text-gray-300 font-bold text-xs">
                  {i}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-tighter">
              <span>Not likely at all</span>
              <span>Extremely likely</span>
            </div>
          </div>
        )}

        {/* Specialized Visual Indicators */}
        {['short_text', 'long_text', 'email'].includes(question.question_type) && (
          <div className="mt-2 p-5 bg-gray-50 border border-dashed rounded-2xl text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-gray-200" />
            {question.question_type === 'short_text' && 'Short text response'}
            {question.question_type === 'long_text' && 'Long text response'}
            {question.question_type === 'email' && 'Valid email address response'}
          </div>
        )}

        {question.question_type === 'rating' && (
          <div className="flex gap-2 mt-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-10 h-10 border-2 border-gray-100 rounded-xl flex items-center justify-center text-gray-300 font-bold">
                {i}
              </div>
            ))}
          </div>
        )}

        {question.question_type === 'date' && (
          <div className="relative max-w-[200px]">
             <input 
              type="date" 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-300 cursor-not-allowed pointer-events-none"
              disabled
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
               <Calendar className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
