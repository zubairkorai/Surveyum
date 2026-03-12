export type ThemeId = 'minimal' | 'modern' | 'dark' | 'gradient' | 'corporate' | 'playful';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  colors: {
    background: string;
    card: string;
    primary: string;
    text: string;
    muted: string;
    accent: string;
  };
  styles: {
    cardRadius: string;
    buttonRadius: string;
    fontFamily: string;
    inputStyle: string;
  };
}

export const SURVEY_THEMES: Record<ThemeId, ThemeConfig> = {
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, simple, and light.',
    colors: {
      background: 'bg-[#F8FAFC] dark:bg-[#0B0F19]',
      card: 'bg-white dark:bg-[#111827]',
      primary: 'bg-blue-600 dark:bg-blue-500',
      text: 'text-gray-900 dark:text-gray-100',
      muted: 'text-gray-400 dark:text-gray-500',
      accent: 'text-blue-600 dark:text-blue-400',
    },
    styles: {
      cardRadius: 'rounded-[32px]',
      buttonRadius: 'rounded-[24px]',
      fontFamily: 'font-sans',
      inputStyle: 'border-gray-100 dark:border-gray-800 focus:border-blue-600 dark:focus:border-blue-500',
    }
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Sleek design with high contrast.',
    colors: {
      background: 'bg-slate-50 dark:bg-slate-950',
      card: 'bg-white dark:bg-slate-900',
      primary: 'bg-indigo-600 dark:bg-indigo-500',
      text: 'text-slate-900 dark:text-slate-100',
      muted: 'text-slate-400 dark:text-slate-500',
      accent: 'text-indigo-600 dark:text-indigo-400',
    },
    styles: {
      cardRadius: 'rounded-2xl',
      buttonRadius: 'rounded-xl',
      fontFamily: 'font-sans',
      inputStyle: 'border-slate-200 dark:border-slate-800 focus:border-indigo-600 dark:focus:border-indigo-500',
    }
  },

  dark: {
    id: 'dark',
    name: 'Midnight',
    description: 'A deep, dark professional theme.',
    colors: {
      background: 'bg-[#0F172A]',
      card: 'bg-[#1E293B]',
      primary: 'bg-blue-500',
      text: 'text-slate-50',
      muted: 'text-slate-400',
      accent: 'text-blue-400',
    },
    styles: {
      cardRadius: 'rounded-3xl',
      buttonRadius: 'rounded-2xl',
      fontFamily: 'font-sans',
      inputStyle: 'border-slate-700 bg-slate-800 text-white focus:border-blue-500',
    }
  },
  gradient: {
    id: 'gradient',
    name: 'Oceanic',
    description: 'Vibrant gradients and soft shadows.',
    colors: {
      background: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500',
      card: 'bg-white/95 backdrop-blur-sm',
      primary: 'bg-gradient-to-r from-blue-600 to-indigo-600',
      text: 'text-slate-900',
      muted: 'text-slate-400',
      accent: 'text-indigo-600',
    },
    styles: {
      cardRadius: 'rounded-[40px]',
      buttonRadius: 'rounded-full',
      fontFamily: 'font-sans',
      inputStyle: 'border-slate-100 focus:border-blue-500',
    }
  },
  corporate: {
    id: 'corporate',
    name: 'Corporate',
    description: 'Sharp, professional, and trustworthy.',
    colors: {
      background: 'bg-gray-100',
      card: 'bg-white',
      primary: 'bg-[#1E293B]',
      text: 'text-gray-900',
      muted: 'text-gray-500',
      accent: 'text-[#1E293B]',
    },
    styles: {
      cardRadius: 'rounded-none border-t-4 border-t-[#1E293B]',
      buttonRadius: 'rounded-sm',
      fontFamily: 'font-serif',
      inputStyle: 'border-gray-300 focus:border-gray-900',
    }
  },
  playful: {
    id: 'playful',
    name: 'Bubblegum',
    description: 'Fun, bubbly, and full of life.',
    colors: {
      background: 'bg-pink-50',
      card: 'bg-white',
      primary: 'bg-rose-500',
      text: 'text-rose-900',
      muted: 'text-rose-300',
      accent: 'text-rose-500',
    },
    styles: {
      cardRadius: 'rounded-[48px] border-4 border-pink-100',
      buttonRadius: 'rounded-[32px]',
      fontFamily: 'font-sans',
      inputStyle: 'border-pink-50 focus:border-rose-400',
    }
  }
};
