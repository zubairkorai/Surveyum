# System Architecture: Survey Platform (SaaS)

## Tech Stack
- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend/Database:** Supabase (Auth, PostgreSQL, Storage, Realtime)
- **Analytics:** Recharts
- **Drag & Drop:** dnd-kit

## Core Components

### 1. Authentication (Supabase Auth)
- **Sign Up / Login:** Email/Password & OAuth (Google/GitHub).
- **Session Management:** handled by `@supabase/ssr` (Next.js middleware).
- **Profile Management:** Users verify email; profile data stored in `public.profiles` table (linked to `auth.users`).

### 2. Database Schema (PostgreSQL)
- **Users:** `profiles` table (id, full_name, avatar_url, billing_plan).
- **Surveys:** `surveys` table (id, user_id, title, description, status, settings).
- **Questions:** `questions` table (id, survey_id, type, logic, order_index).
- **Choices:** `choices` table (id, question_id, label, value) for multiple choice/dropdown.
- **Responses:** `responses` table (id, survey_id, respondent_id (optional), started_at, completed_at).
- **Answers:** `answers` table (id, response_id, question_id, value (jsonb)).

### 3. Survey Builder (Frontend - dnd-kit)
- **State Management:** Local React state or Context for the survey being edited.
- **Components:**
    - `SurveyEditor`: Main canvas.
    - `Toolbox`: Draggable question types.
    - `QuestionCard`: Individual question component (handles editing).
    - `PropertiesPanel`: Edit settings for selected question.

### 4. Public Survey Engine
- **Routing:** `/s/[surveyId]` or `/s/[customSlug]`
- **Logic:** Evaluates conditional logic on the client-side (or server-side for initial render) to show/hide questions.
- **Submission:** Optimistic UI updates; data sent to `responses` and `answers` tables via Supabase RPC or direct insert if RLS allows.

### 5. Analytics Dashboard
- **Aggregation:** SQL Views or Supabase Edge Functions to aggregate data (counts, averages).
- **Visualization:** Recharts for bar charts (choices), pie charts, and line charts (responses over time).

## Security (RLS)
- **Surveys:** Users can only CRUD their own surveys.
- **Public Access:** Anyone can read *published* surveys.
- **Responses:** 
    - Survey owners can read all responses for their surveys.
    - Respondents can only insert answers (and potentially read their own if authenticated).

## Folder Structure
```
/app
  /(auth)           # Login, Register routes
  /(dashboard)      # Authenticated user routes (surveys, analytics)
  /s/[surveyId]     # Public survey view
  /api              # API routes (if needed for complex logic)
/components
  /ui               # Shadcn UI components
  /survey-builder   # Drag & drop builder components
  /analytics        # Charts and data viz
/lib
  supabase.ts       # Supabase client
  utils.ts          # Helper functions
/types              # TypeScript interfaces
```
