export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  updated_at: string;
};

export type Survey = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  settings?: any; // JSONB
};

export type QuestionType = 
  | 'short_text' 
  | 'long_text' 
  | 'multiple_choice' 
  | 'checkbox' 
  | 'dropdown' 
  | 'rating' 
  | 'date'
  | 'likert_scale'
  | 'yes_no'
  | 'email'
  | 'nps'
  | 'matrix'
  | 'best_worst'
  | 'ranking'
  | 'slider'
  | 'multiple_textboxes'
  | 'image_choice';

export type Question = {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: QuestionType;
  is_required: boolean;
  order_index: number;
  settings?: any; // JSONB (e.g., matrix rows, slider min/max)
  created_at?: string;
  choices?: Choice[]; // joined
};

export type Choice = {
  id: string;
  question_id: string;
  label: string;
  value: string;
  order_index: number;
  image_url?: string; // For image_choice
};

export type ResponseStatus = 'in_progress' | 'completed';

export type SurveyResponse = {
  id: string;
  survey_id: string;
  respondent_id: string | null;
  started_at: string;
  completed_at: string | null;
  status: ResponseStatus;
};

export type Answer = {
  id: string;
  response_id: string;
  question_id: string;
  value: string | null;
  selected_choices: string[] | null; // JSONB array of values
  created_at?: string;
  matrix_answers?: any; // For matrix questions
};
