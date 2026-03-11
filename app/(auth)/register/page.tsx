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
    <div className="flex-1 flex flex-col w-full px-6 sm:max-w-md justify-center bg-white min-h-screen pt-20 pb-12">
      <div className="absolute left-0 top-0 w-full p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to home
        </Link>
      </div>

      <div className="w-full">
        <div className="flex flex-col mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg font-bold mb-6">S</div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight text-center sm:text-left">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1.5 text-center sm:text-left">Join thousands of researchers building better surveys.</p>
        </div>

        <form className="flex flex-col w-full gap-5" action={signup}>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="fullName">
              Full name
            </label>
            <input
              className="rounded-lg px-4 py-2.5 bg-white border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-sm"
              name="fullName"
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="email">
              Work email
            </label>
            <input
              className="rounded-lg px-4 py-2.5 bg-white border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-sm"
              name="email"
              type="email"
              placeholder="name@company.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              className="rounded-lg px-4 py-2.5 bg-white border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-sm"
              type="password"
              name="password"
              placeholder="Create a strong password"
              required
            />
          </div>

          <button className="bg-blue-600 rounded-lg px-4 py-2.5 text-white font-medium text-sm mt-2 hover:bg-blue-700 transition-all shadow-sm active:scale-[0.99] flex items-center justify-center">
            Create account
          </button>

          <SocialAuth />

          {message && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium text-center rounded-lg animate-in fade-in slide-in-from-top-1">
              {message}
            </div>
          )}

          <div className="text-sm text-center mt-6 pt-6 border-t border-gray-100 text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Sign in instead
            </Link>
          </div>
        </form>
      </div>
      
      <p className="text-center text-xs text-gray-400 mt-12">
        By signing up, you agree to our Terms of Service.
      </p>
    </div>
  );
}
