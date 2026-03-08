'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QuestionCard } from './QuestionCard';
import { Question } from '@/types';

interface SortableQuestionProps {
  question: Question;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  removeQuestion: (id: string) => void;
  addChoice: (questionId: string) => void;
  updateChoice: (questionId: string, choiceId: string, label: string) => void;
  removeChoice: (questionId: string, choiceId: string) => void;
}

export function SortableQuestion(props: SortableQuestionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <QuestionCard 
        {...props} 
        dragHandleProps={{ ...attributes, ...listeners }} 
      />
    </div>
  );
}
