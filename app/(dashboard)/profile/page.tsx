import { createClient } from '@/lib/supabase/server';
import { updateProfile } from './actions';
import { User, Mail, Camera, Save, CheckCircle } from 'lucide-react';

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; success?: string }>;
}) {
  const { message, success } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  return (
    <div className="p-8 max-w-2xl mx-auto text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Your Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage your personal information and account settings.</p>
      </div>

      <div className="bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-xl shadow-blue-100/50 dark:shadow-none">
        <form action={updateProfile} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center border-2 border-dashed border-blue-200 dark:border-blue-800 group hover:border-blue-400 transition-all cursor-pointer overflow-hidden relative">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-blue-300 dark:text-blue-700" />
              )}
              <div className="absolute inset-0 bg-black/20 dark:bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-center">Profile Picture</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2" htmlFor="fullName">
                <User className="w-4 h-4 text-gray-400" />
                Full Name
              </label>
              <input
                className="rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-0 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all outline-none"
                name="fullName"
                defaultValue={profile?.full_name || ''}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2" htmlFor="email">
                <Mail className="w-4 h-4 text-gray-400" />
                Email Address
              </label>
              <input
                className="rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed outline-none"
                value={user?.email || ''}
                disabled
              />
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Email cannot be changed directly.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2" htmlFor="avatarUrl">
                <Camera className="w-4 h-4 text-gray-400" />
                Avatar Image URL
              </label>
              <input
                className="rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-0 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all outline-none"
                name="avatarUrl"
                defaultValue={profile?.avatar_url || ''}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 rounded-xl px-4 py-4 text-white font-bold mt-8 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 dark:hover:shadow-blue-900/20 active:scale-[0.98]"
          >
            <Save className="w-5 h-5" />
            Save Profile Changes
          </button>

          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium text-center animate-in fade-in slide-in-from-top-2 ${
              success === 'true' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-100 dark:border-green-900/30' 
                : 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30'
            }`}>
              {message}
            </div>
          )}
        </form>
      </div>

      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
        <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">Account Safety</h4>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 leading-relaxed font-medium">
            Your profile information is only visible to you. Surveyum ensures your personal data remains private and secure using advanced encryption.
          </p>
        </div>
      </div>
    </div>
  );
}
