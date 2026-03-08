import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Question, QuestionType, Choice } from '@/types';
import { arrayMove } from '@dnd-kit/sortable';

export function useSurveyBuilder(initialQuestions: Question[] = []) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  const addQuestion = useCallback((type: QuestionType) => {
    setQuestions((prev) => {
      let choices: Choice[] = [];
      
      if (['multiple_choice', 'checkbox', 'dropdown'].includes(type)) {
        choices = [{ id: uuidv4(), question_id: '', label: '', value: '', order_index: 0 }];
      } else if (type === 'yes_no') {
        choices = [
          { id: uuidv4(), question_id: '', label: 'Yes', value: 'yes', order_index: 0 },
          { id: uuidv4(), question_id: '', label: 'No', value: 'no', order_index: 1 }
        ];
      } else if (type === 'likert_scale') {
        choices = [
          { id: uuidv4(), question_id: '', label: 'Strongly Disagree', value: '1', order_index: 0 },
          { id: uuidv4(), question_id: '', label: 'Disagree', value: '2', order_index: 1 },
          { id: uuidv4(), question_id: '', label: 'Neutral', value: '3', order_index: 2 },
          { id: uuidv4(), question_id: '', label: 'Agree', value: '4', order_index: 3 },
          { id: uuidv4(), question_id: '', label: 'Strongly Agree', value: '5', order_index: 4 }
        ];
      }

      let question_text = '';
      if (type === 'nps') {
        question_text = 'How likely are you to recommend us to a friend or colleague?';
      }

      const newQuestion: Question = {
        id: uuidv4(),
        survey_id: '', 
        question_text, 
        question_type: type,
        is_required: false,
        order_index: prev.length,
        choices,
      };
      return [...prev, newQuestion];
    });
  }, []);

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  }, []);

  const removeQuestion = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const moveQuestion = useCallback((activeId: string, overId: string) => {
    setQuestions((prev) => {
      const oldIndex = prev.findIndex((q) => q.id === activeId);
      const newIndex = prev.findIndex((q) => q.id === overId);
      return arrayMove(prev, oldIndex, newIndex).map((q, idx) => ({
        ...q,
        order_index: idx,
      }));
    });
  }, []);

  const addChoice = useCallback((questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.choices) {
          const newChoice: Choice = {
            id: uuidv4(),
            question_id: questionId,
            label: '', // Empty label for light placeholder
            value: '',
            order_index: q.choices.length,
          };
          return { ...q, choices: [...q.choices, newChoice] };
        }
        return q;
      })
    );
  }, []);

  const updateChoice = useCallback((questionId: string, choiceId: string, label: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.choices) {
          return {
            ...q,
            choices: q.choices.map((c) =>
              c.id === choiceId ? { ...c, label, value: label.toLowerCase().replace(/\s+/g, '-') } : c
            ),
          };
        }
        return q;
      })
    );
  }, []);

  const removeChoice = useCallback((questionId: string, choiceId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.choices) {
          return { ...q, choices: q.choices.filter((c) => c.id !== choiceId) };
        }
        return q;
      })
    );
  }, []);

  return {
    questions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    moveQuestion,
    addChoice,
    updateChoice,
    removeChoice,
  };
}
