'use client';

import { signInWithSocial } from '@/app/(auth)/actions';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export function SocialAuth() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSocialSignIn = async (provider: 'google') => {
    setIsGoogleLoading(true);
    await signInWithSocial(provider);
  };

  return (
    <div className="flex flex-col gap-3 w-full mt-6">
      <div className="relative flex items-center gap-4 my-2">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Or continue with</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <button
        type="button"
        onClick={() => handleSocialSignIn('google')}
        disabled={isGoogleLoading}
        className="flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm text-gray-700 shadow-sm"
      >
        {isGoogleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.9 0 3.61.65 4.95 1.93l3.71-3.71C18.41 1.24 15.42 0 12 0 7.31 0 3.31 2.69 1.34 6.64l4.33 3.36c1.02-3.06 3.88-5.32 6.33-5.32z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.82-.07-1.61-.21-2.38H12v4.5h6.44c-.28 1.5-.1.3 1.13 2.22l4.33 3.36c2.53-2.34 3.59-5.8 3.59-7.7z"
            />
            <path
              fill="#FBBC05"
              d="M5.67 14.71c-.26-.77-.41-1.6-.41-2.46s.15-1.69.41-2.46L1.34 6.64C.49 8.34 0 10.12 0 12s.49 3.66 1.34 5.36l4.33-3.36c-.26.77-.41 1.6-.41 2.46z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.83-3.18c-1.1.74-2.5 1.18-4.13 1.18-3.17 0-5.86-2.14-6.82-5.04l-4.33 3.36C3.31 21.31 7.31 24 12 24z"
            />
          </svg>
        )}
        Sign in with Google
      </button>
    </div>
  );
}
