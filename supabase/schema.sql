-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE (Public user data)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- SURVEYS TABLE
CREATE TABLE surveys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Survey',
  description TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS for Surveys
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own surveys." ON surveys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own surveys." ON surveys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own surveys." ON surveys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own surveys." ON surveys
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can view published surveys." ON surveys
  FOR SELECT USING (is_published = true);


-- QUESTIONS TABLE
CREATE TABLE questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'short_text', 'long_text', 'multiple_choice', 'checkbox', 'dropdown', 'rating', 'date'
  is_required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb, -- Store extra settings like min/max rating, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS for Questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Policy: Survey owners can manage questions.
CREATE POLICY "Survey owners can manage questions." ON questions
  USING (EXISTS (
    SELECT 1 FROM surveys 
    WHERE surveys.id = questions.survey_id 
    AND surveys.user_id = auth.uid()
  ));

-- Policy: Public can view questions of published surveys.
CREATE POLICY "Public can view questions of published surveys." ON questions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM surveys 
    WHERE surveys.id = questions.survey_id 
    AND surveys.is_published = true
  ));


-- CHOICES TABLE (For multiple choice, checkbox, dropdown)
CREATE TABLE choices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- RLS for Choices
ALTER TABLE choices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Survey owners can manage choices." ON choices
  USING (EXISTS (
    SELECT 1 FROM questions 
    JOIN surveys ON questions.survey_id = surveys.id
    WHERE questions.id = choices.question_id 
    AND surveys.user_id = auth.uid()
  ));

CREATE POLICY "Public can view choices of published surveys." ON choices
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM questions 
    JOIN surveys ON questions.survey_id = surveys.id
    WHERE questions.id = choices.question_id 
    AND surveys.is_published = true
  ));


-- RESPONSES TABLE
CREATE TABLE responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE NOT NULL,
  respondent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for anonymous responses
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'in_progress' -- 'in_progress', 'completed'
);

-- RLS for Responses
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Survey owners can view all responses for their surveys.
CREATE POLICY "Survey owners can view responses." ON responses
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM surveys 
    WHERE surveys.id = responses.survey_id 
    AND surveys.user_id = auth.uid()
  ));

-- Public can create responses (submit surveys).
CREATE POLICY "Public can create responses." ON responses
  FOR INSERT WITH CHECK (true);
  
-- Respondents can update their own responses (e.g. to mark as completed).
-- This is tricky for anonymous users. Typically, we might use a browser cookie or return the ID to the client.
-- For simplicity, we allow update if the ID matches (assuming the client has the ID).
-- But RLS needs a user context. For anonymous, we might rely on the insert returning the ID and then subsequent updates using a secret token or just keep it simple: insert only, or only authenticated users can update.
-- Let's stick to: Public can insert. 


-- ANSWERS TABLE
CREATE TABLE answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  response_id UUID REFERENCES responses(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  value TEXT, -- Storing all answers as text or JSON. Text is simpler for querying.
  selected_choices JSONB, -- For multiple checkbox selections
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS for Answers
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Survey owners can view answers.
CREATE POLICY "Survey owners can view answers." ON answers
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM responses
    JOIN surveys ON responses.survey_id = surveys.id
    WHERE responses.id = answers.response_id
    AND surveys.user_id = auth.uid()
  ));

-- Public can insert answers.
CREATE POLICY "Public can insert answers." ON answers
  FOR INSERT WITH CHECK (true);


-- TRIGGER FOR NEW USER PROFILE
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
