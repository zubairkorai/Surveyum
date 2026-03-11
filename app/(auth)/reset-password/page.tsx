import { updatePassword } from '../actions';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const { message } = await searchParams;

  return (
    <div className="flex-1 flex flex-col w-full px-6 sm:max-w-md justify-center bg-white">
      <div className="w-full">
        <div className="flex flex-col mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Set new password</h1>
          <p className="text-gray-500 text-sm mt-1.5">Choose a strong password to secure your account.</p>
        </div>

        <form className="flex flex-col w-full gap-5" action={updatePassword}>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="password">
              New password
            </label>
            <input
              className="rounded-lg px-4 py-2.5 bg-white border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-sm"
              name="password"
              type="password"
              placeholder="••••••••••••"
              required
            />
          </div>

          <button className="bg-blue-600 rounded-lg px-4 py-2.5 text-white font-medium text-sm mt-2 hover:bg-blue-700 transition-all shadow-sm active:scale-[0.99] flex items-center justify-center">
            Update password
          </button>

          {message && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-700 text-sm font-medium text-center rounded-lg animate-in fade-in slide-in-from-top-1">
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
