import React, { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';
import RobotFace from './RobotFace';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../config/api';

export default function DailyAITip() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const isUrdu = i18n.language === 'ur';
  const [tip, setTip] = useState(null);

  useEffect(() => {
    const getTip = async () => {
      const token = localStorage.getItem('peanutiq_token');
      if (!token) return;
      try {
        const res = await fetchApi('/dashboard/advisories?type=tip&limit=1', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) setTip(data[0].message);
        }
      } catch (e) {
        console.error(e);
      }
    };
    getTip();
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : (isUrdu ? 'Kisan Bhai' : 'Farmer');

  return (
    <div className="bg-gradient-to-r rtl:bg-gradient-to-l from-forest/5 to-transparent border border-forest/20 rounded-2xl py-3 px-4 shadow-sm flex flex-row items-center gap-3 relative overflow-hidden group">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 right-0 rtl:left-0 rtl:right-auto -translate-y-1/2 w-48 h-48 bg-[#f0c169]/10 rounded-full blur-3xl group-hover:bg-[#f0c169]/20 transition-all duration-500 pointer-events-none"></div>

      <div className="flex-shrink-0 relative z-10 animate-float">
        <div className="w-12 h-12 rounded-full bg-forest border-2 border-white/40 flex items-center justify-center shadow-lg relative overflow-hidden">
          <RobotFace className="w-9 h-9 text-[#f0c169]" />
        </div>
      </div>

      <div className="flex-1 relative z-10 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-[12px] font-black text-forest uppercase tracking-widest">
            {isUrdu ? 'روزانہ اے آئی ٹپ' : 'Daily AI Tip'}
          </h3>
          <span className="w-1.5 h-1.5 rounded-full bg-[#f0c169] animate-pulse"></span>
        </div>
        <p className="text-[13px] text-charcoal/90 font-bold leading-tight" dir={isUrdu ? 'rtl' : 'ltr'}>
          {isUrdu 
            ? `${firstName}! ${tip || 'موسم کی پیشگوئی کے مطابق آج بارش کا امکان ہے۔ فصل کی نکاسی کا خیال رکھیں۔'}`
            : `${firstName}! ${tip || 'According to the weather forecast, rain is expected today. Ensure proper field drainage.'}`}
        </p>
      </div>

      <button 
        className="flex-shrink-0 w-10 h-10 rounded-full bg-[#f0c169] text-forest flex items-center justify-center shadow-[0_0_15px_rgba(240,193,105,0.4)] hover:scale-110 transition-transform animate-pulse cursor-pointer relative z-10" 
        title="Ask AI via Voice"
        onClick={() => window.dispatchEvent(new Event('open-robot'))}
      >
        <Mic className="w-4 h-4" />
      </button>
    </div>
  );
}
