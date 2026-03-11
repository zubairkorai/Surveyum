import Link from 'next/link';
import { ArrowRight, BarChart2, LayoutDashboard, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">S</div>
          <span className="text-xl font-bold text-gray-900 hidden xs:block">Surveyum</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
            Log In
          </Link>
          <Link 
            href="/register" 
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto py-12 md:py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-6 sm:mb-8">
          <Zap className="w-3 h-3" />
          The ultimate survey builder
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 sm:mb-8 leading-[1.1]">
          Build smarter surveys in <span className="text-blue-600">minutes</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-500 mb-10 sm:mb-12 max-w-2xl leading-relaxed px-2">
          Create, share, and analyze surveys with our intuitive drag-and-drop builder. 
          Collect powerful insights and make data-driven decisions today.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4 sm:px-0">
          <Link 
            href="/register" 
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-200 active:scale-95 text-lg"
          >
            Create Your First Survey
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all text-lg"
          >
            View Demo
          </Link>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-16 md:mt-24 w-full text-left">
          <div className="p-6 sm:p-8 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-blue-600">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Drag & Drop Builder</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Intuitive interface to build complex surveys without writing a single line of code.
            </p>
          </div>

          <div className="p-6 sm:p-8 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-green-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Instant Insights</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Real-time response tracking and automatic data processing for immediate analysis.
            </p>
          </div>

          <div className="p-6 sm:p-8 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-purple-600">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Visual Analytics</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Beautiful charts and graphs that help you visualize survey results effortlessly.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t text-center text-gray-400 text-sm">
        <p>© 2026 Surveyum Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
