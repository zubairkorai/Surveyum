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
    <div className="p-8 max-w-2xl mx-auto text-gray-900">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Profile</h1>
        <p className="text-gray-500 mt-2 font-medium">Manage your personal information and account settings.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl shadow-blue-100/50">
        <form action={updateProfile} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center border-2 border-dashed border-blue-200 group hover:border-blue-400 transition-all cursor-pointer overflow-hidden relative">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-blue-300" />
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest text-center">Profile Picture</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2" htmlFor="fullName">
                <User className="w-4 h-4 text-gray-400" />
                Full Name
              </label>
              <input
                className="rounded-xl px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-600 focus:ring-0 text-gray-900 placeholder:text-gray-400 transition-all outline-none"
                name="fullName"
                defaultValue={profile?.full_name || ''}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2" htmlFor="email">
                <Mail className="w-4 h-4 text-gray-400" />
                Email Address
              </label>
              <input
                className="rounded-xl px-4 py-3 bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed outline-none"
                value={user?.email || ''}
                disabled
              />
              <p className="text-[10px] text-gray-400 font-medium">Email cannot be changed directly.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2" htmlFor="avatarUrl">
                <Camera className="w-4 h-4 text-gray-400" />
                Avatar Image URL
              </label>
              <input
                className="rounded-xl px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-600 focus:ring-0 text-gray-900 placeholder:text-gray-400 transition-all outline-none"
                name="avatarUrl"
                defaultValue={profile?.avatar_url || ''}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 rounded-xl px-4 py-4 text-white font-bold mt-8 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 active:scale-[0.98]"
          >
            <Save className="w-5 h-5" />
            Save Profile Changes
          </button>

          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium text-center animate-in fade-in slide-in-from-top-2 ${
              success === 'true' ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-amber-50 text-amber-800 border border-amber-100'
            }`}>
              {message}
            </div>
          )}
        </form>
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
        <CheckCircle className="w-6 h-6 text-blue-600 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-blue-900">Account Safety</h4>
          <p className="text-xs text-blue-700 mt-1 leading-relaxed font-medium">
            Your profile information is only visible to you. Surveyum ensures your personal data remains private and secure using advanced encryption.
          </p>
        </div>
      </div>
    </div>
  );
}
