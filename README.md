# SurveyPlatform - SaaS Survey Tool

A production-ready, full-stack SaaS survey platform similar to SurveyMonkey, built with modern web technologies.

## 🚀 Features

- **Auth System:** Secure Sign-up, Login, and Logout using Supabase Auth.
- **Drag-and-Drop Builder:** Intuitive survey creation using `@dnd-kit`.
- **7+ Question Types:** Short Text, Long Text, Multiple Choice, Checkboxes, Dropdown, Rating, and Date.
- **Real-time Persistence:** Saves survey drafts and updates to Supabase PostgreSQL.
- **Public Survey Engine:** Shared links for anyone to respond to published surveys.
- **Analytics Dashboard:** Beautiful data visualization with Recharts (Pie/Bar charts).
- **Security:** Row Level Security (RLS) ensuring users only see their own surveys and results.
- **Responsive UI:** Clean, modern dashboard built with Tailwind CSS and Lucide icons.

## 🛠️ Tech Stack

- **Frontend:** [Next.js 14 (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Backend/DB:** [Supabase](https://supabase.com/) (Auth, PostgreSQL, RLS)
- **Charts:** [Recharts](https://recharts.org/)
- **Drag & Drop:** [dnd-kit](https://dnd-kit.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Toasts:** [Sonner](https://sonner.emilkowal.ski/)

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd survey-platform
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Supabase
1. Create a new project on [Supabase](https://supabase.com/).
2. Go to the **SQL Editor** and paste the contents of `supabase/schema.sql`. Run the script to create tables and RLS policies.
3. Get your **Project URL** and **Anon Key** from Project Settings > API.

### 4. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 5. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📝 Folder Structure

- `/app`: Next.js App Router (Auth, Dashboard, Public routes)
- `/components`: Reusable UI and Survey Builder components
- `/hooks`: Custom React hooks (e.g., `useSurveyBuilder`)
- `/lib`: Utility functions and Supabase clients
- `/supabase`: Database schema and RLS policies
- `/types`: TypeScript interfaces

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
