import Link from 'next/link';
import { signup } from '../actions';
import { ArrowLeft } from 'lucide-react';
import { SocialAuth } from '@/components/SocialAuth';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const { message } = await searchParams;

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-6">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-xl text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 flex items-center group text-sm font-semibold transition-all"
      >
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back
      </Link>

      <div className="bg-white border rounded-3xl p-8 shadow-xl shadow-blue-100/50">
        <form
          className="flex-1 flex flex-col w-full justify-center gap-4"
          action={signup}
        >
          <div className="mb-4">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Join Surveyum</h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">Create your account to start building surveys.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700" htmlFor="fullName">
              Full Name
            </label>
            <input
              className="rounded-xl px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-600 focus:ring-0 text-gray-900 placeholder:text-gray-400 transition-all outline-none"
              name="fullName"
              placeholder="John Doe"
              required
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700" htmlFor="email">
              Email Address
            </label>
            <input
              className="rounded-xl px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-600 focus:ring-0 text-gray-900 placeholder:text-gray-400 transition-all outline-none"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              className="rounded-xl px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-600 focus:ring-0 text-gray-900 placeholder:text-gray-400 transition-all outline-none"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button className="bg-blue-600 rounded-xl px-4 py-3 text-white font-bold mt-4 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 active:scale-[0.98]">
            Create Account
          </button>

          <SocialAuth />

          {message && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-100 text-amber-800 text-sm font-medium text-center rounded-xl animate-in fade-in slide-in-from-top-2">
              {message}
            </div>
          )}

          <div className="text-sm text-center mt-6 pt-6 border-t border-gray-100 text-gray-500 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all">
              Log In
            </Link>
          </div>
        </form>
      </div>
      
      <p className="text-center text-xs text-gray-400">
        © 2026 Surveyum. Join the community.
      </p>
    </div>
  );
}
