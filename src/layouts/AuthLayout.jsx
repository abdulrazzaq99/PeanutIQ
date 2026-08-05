import { Outlet } from 'react-router-dom';
import { Leaf, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AuthLayout() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ur' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ur' ? 'rtl' : 'ltr';
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Language Switcher */}
      <div className="absolute top-4 end-4 z-50">
        <button
          onClick={toggleLanguage}
          className="flex items-center px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-slate-200 text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
        >
          <Globe className="w-4 h-4 me-2" />
          {i18n.language === 'ur' ? 'English' : 'اردو'}
        </button>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      <div className="absolute bottom-[10%] right-[20%] w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-white/80 backdrop-blur-md rounded-2xl shadow-glass border border-white/60 flex items-center justify-center">
            <Leaf className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
          PeanutIQ
        </h2>
        <p className="text-center text-sm font-medium text-emerald-700 mb-8 uppercase tracking-widest">
          Agentic AI Ecosystem
        </p>

        <div className="glass-panel p-8 rounded-3xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
