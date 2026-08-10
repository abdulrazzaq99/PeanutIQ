import React from 'react';
import { Sprout, Flower2, Bean, Package, Tractor, Leaf, Nut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CropLifecycle() {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  
  const stages = [
    { id: 'sowing', label: isUrdu ? 'بوائی' : 'Sowing', icon: Nut, active: true, completed: true },
    { id: 'flowering', label: isUrdu ? 'پھول آنا' : 'Flowering', icon: Flower2, active: true, completed: true },
    { id: 'pegging', label: isUrdu ? 'پھلیاں بننا' : 'Pegging', icon: Bean, active: true, completed: false }, // Current active stage
    { id: 'podFill', label: isUrdu ? 'پھلی بھرنا' : 'Pod Fill', icon: Package, active: false, completed: false },
    { id: 'harvesting', label: isUrdu ? 'کٹائی' : 'Harvesting', icon: Tractor, active: false, completed: false },
  ];

  return (
    <div className="bg-white border border-earth rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      <h3 className="text-[17px] font-bold text-charcoal mb-6 flex items-center">
        <Leaf className={`w-5 h-5 ${isUrdu ? 'ms-2' : 'me-2'} text-[#07571C]`} strokeWidth={2.5} />
        {isUrdu ? 'فصل کی نشوونما کا مرحلہ' : 'Crop Lifecycle Stage'}
      </h3>
      
      <div className="overflow-x-auto no-scrollbar pb-2 -mx-2 px-2">
        <div className="relative flex justify-between items-center w-full min-w-[480px] max-w-4xl mx-auto mt-2">
          {/* Background Line */}
          <div className="absolute left-[10%] right-[10%] rtl:right-[10%] rtl:left-[10%] top-6 -translate-y-1/2 h-1.5 bg-earth rounded-full z-0"></div>
        
        {/* Active Progress Line */}
        <div className="absolute left-[10%] rtl:right-[10%] rtl:left-auto top-6 -translate-y-1/2 h-1.5 bg-[#07571C] rounded-full z-0 transition-all duration-1000 w-[50%]"></div>
        
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isCurrent = stage.active && !stage.completed;
          
          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center group w-1/5">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-[3px] shadow-sm
                ${stage.completed ? 'bg-[#07571C] border-[#07571C] text-white' : 
                  isCurrent ? 'bg-white border-[#07571C] text-[#07571C] scale-110 shadow-[0_0_15px_rgba(7,87,28,0.3)]' : 
                  'bg-earth border-earth text-charcoal/40'}
              `}>
                <Icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} strokeWidth={isCurrent ? 2.5 : 2} />
              </div>
              <span className={`
                mt-3 text-[13px] font-bold tracking-tight transition-colors duration-300 text-center
                ${stage.completed ? 'text-charcoal' : 
                  isCurrent ? 'text-[#07571C]' : 
                  'text-charcoal/40'}
              `}>
                {stage.label}
              </span>
              
              {/* Current Stage Indicator Ping */}
              {isCurrent && (
                <div className="absolute top-0 w-12 h-12 rounded-full border-2 border-[#07571C] animate-ping opacity-20 pointer-events-none"></div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
