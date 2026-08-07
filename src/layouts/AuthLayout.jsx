import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Globe, ChevronDown, ShieldCheck, Tractor, Wheat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';

export default function AuthLayout() {
  const { t, i18n } = useTranslation();

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const setLanguage = (lang) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    localStorage.setItem('preferredLanguage', lang);
    setIsLangMenuOpen(false);
  };
  
  return (
    <div className="h-screen flex flex-col lg:flex-row bg-sand relative overflow-hidden font-sans">
      
      {/* Left Side: Image Panel */}
      <div className="hidden lg:flex flex-col w-1/2 relative overflow-hidden z-20 shadow-2xl p-10 justify-between shrink-0">
        {/* Background Image - Bright sky for dark text visibility */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80)' }}
        >
          {/* Subtle gradient at bottom for the feature cards */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"></div>
          {/* Subtle gradient at top-start to ensure text is readable */}
          <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-white/70 via-white/30 to-transparent"></div>
        </div>

        {/* Top Content */}
        <div className="relative z-10 max-w-md pt-8">
          {/* Logo & Name */}
          <div className="flex items-center mb-8">
            <Logo className="w-9 h-9 mr-3" iconColor="#2A3F22" sparkleColor="#07571C" />
            <span className="text-3xl font-bold text-[#1D2B15] font-serif tracking-tight" dir="ltr">
              Peanut<span className="text-[#07571C]">IQ</span>
            </span>
          </div>
          
          <h1 className={`text-[3.5rem] font-medium mb-6 leading-[1.15] text-[#1D2B15] font-serif tracking-tight ${i18n.language === 'ur' ? 'leading-normal text-5xl' : ''}`}>
            {i18n.language === 'ur' ? 'ایک بہتر کل کی شروعات' : <>Growing a better<br/>tomorrow</>}
          </h1>
          
          <div className="w-12 h-0.5 bg-[#07571C] mb-6"></div>
          
          <p className="text-[15px] text-[#334229] leading-relaxed max-w-[280px] font-medium">
            {i18n.language === 'ur' 
              ? 'جدید زراعت کے لیے سمارٹ حل۔ ٹیکنالوجی کے ذریعے اپنی پیداوار کا انتظام، نگرانی اور اضافہ کریں۔' 
              : 'Smart solutions for modern farming. Manage, Monitor and Maximize your yield with technology.'}
          </p>
        </div>

        {/* Bottom Feature Cards */}
        <div className="relative z-10 w-full mt-auto pb-4">
          <div className="bg-[#1A2612]/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex justify-between items-start gap-4">
            
            {/* Feature 1 */}
            <div className="flex-1 text-center sm:text-start flex flex-col items-center sm:items-start">
              <div className="mb-3">
                <Tractor className="w-6 h-6 text-[#A3D977]" strokeWidth={1.5} />
              </div>
              <h4 className="text-white text-xs font-bold mb-1">{i18n.language === 'ur' ? 'سمارٹ زراعت' : 'Smart Farming'}</h4>
              <p className="text-white/60 text-[10px] leading-tight">{i18n.language === 'ur' ? 'ڈیٹا پر مبنی فیصلے' : <>Data driven<br/>decisions</>}</p>
            </div>
            
            {/* Divider */}
            <div className="hidden sm:block w-px h-16 bg-white/10 self-center"></div>
            
            {/* Feature 2 */}
            <div className="flex-1 text-center sm:text-start flex flex-col items-center sm:items-start">
              <div className="mb-3">
                <ShieldCheck className="w-6 h-6 text-[#A3D977]" strokeWidth={1.5} />
              </div>
              <h4 className="text-white text-xs font-bold mb-1">{i18n.language === 'ur' ? 'فصل کی صحت' : 'Crop Health'}</h4>
              <p className="text-white/60 text-[10px] leading-tight">{i18n.language === 'ur' ? 'فصلوں کی نگرانی اور حفاظت' : <>Monitor & protect<br/>your crops</>}</p>
            </div>
            
            {/* Divider */}
            <div className="hidden sm:block w-px h-16 bg-white/10 self-center"></div>
            
            {/* Feature 3 */}
            <div className="flex-1 text-center sm:text-start flex flex-col items-center sm:items-start">
              <div className="mb-3">
                <Wheat className="w-6 h-6 text-[#A3D977]" strokeWidth={1.5} />
              </div>
              <h4 className="text-white text-xs font-bold mb-1">{i18n.language === 'ur' ? 'بہتر پیداوار' : 'Better Yield'}</h4>
              <p className="text-white/60 text-[10px] leading-tight">{i18n.language === 'ur' ? 'پائیدار پیداوار میں اضافہ' : <>Increase productivity<br/>sustainably</>}</p>
            </div>

          </div>
        </div>
      </div>

      {/* Right Side: Form Container */}
      <div className="flex-1 flex flex-col relative z-10 h-screen overflow-hidden">
        
        {/* Mobile Logo & Name */}
        <div className="absolute top-8 start-6 sm:start-8 z-50 flex items-center lg:hidden">
          <Logo className="w-7 h-7 rtl:ml-2 ltr:mr-2 flex-shrink-0" iconColor="#07571C" sparkleColor="#07571C" />
          <span className="text-xl font-bold text-charcoal font-serif tracking-tight" dir="ltr">
            Peanut<span className="text-forest">IQ</span>
          </span>
        </div>
        
        {/* Language Switcher */}
        <div className="absolute top-8 end-8 lg:end-12 z-50 flex flex-col items-end">
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center px-4 py-2 bg-transparent rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-forest/10 hover:text-forest hover:border-transparent transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 me-2 opacity-60" />
            {i18n.language === 'ur' ? 'اردو' : 'English'}
            <ChevronDown className={`w-3.5 h-3.5 ms-2 opacity-60 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isLangMenuOpen && (
            <div className="absolute top-full mt-2 w-32 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden py-1 z-50">
                <button
                  onClick={() => setLanguage('en')}
                  className={`w-full text-start px-4 py-2.5 text-sm font-medium hover:bg-forest/10 active:bg-forest/20 transition-colors ${i18n.language === 'en' ? 'bg-green-50/50 text-[#07571C]' : 'text-gray-700'}`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('ur')}
                  className={`w-full text-start px-4 py-2.5 text-sm font-medium hover:bg-forest/10 active:bg-forest/20 transition-colors ${i18n.language === 'ur' ? 'bg-green-50/50 text-[#07571C]' : 'text-gray-700'}`}
                >
                  اردو
                </button>
            </div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:px-20 lg:py-4 w-full max-w-xl mx-auto">
          

          
          {/* Outlet for Form */}
          <div className="w-full">
            <Outlet />
          </div>


          
        </div>
      </div>
    </div>
  );
}
