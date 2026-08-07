import React, { useState } from 'react';
import { Droplets, Shield, CalendarClock, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function UpcomingActions() {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  
  const [completedTasks, setCompletedTasks] = useState({});

  const tasks = [
    {
      id: 1,
      title: isUrdu ? 'کھیت 2 کو پانی دیں' : 'Irrigate Field 2',
      time: isUrdu ? 'کل صبح 8:00 بجے تک' : 'Due Tomorrow, 8:00 AM',
      category: isUrdu ? 'آبپاشی' : 'IRRIGATION',
      icon: Droplets,
      color: 'text-sky-500',
      bgColor: 'bg-sky-50'
    },
    {
      id: 2,
      title: isUrdu ? 'پھپھوندی کش سپرے کریں' : 'Apply Fungicide (Chlorothalonil)',
      time: isUrdu ? 'آج شام 5:00 بجے تک' : 'Due Today, 5:00 PM',
      category: isUrdu ? 'بیماری کنٹرول' : 'DISEASE CONTROL',
      icon: Shield,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50'
    }
  ];

  const toggleTask = (id) => {
    setCompletedTasks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 bg-white border border-earth rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[17px] font-bold text-charcoal flex items-center">
          <CalendarClock className={`w-5 h-5 ${isUrdu ? 'ms-2.5' : 'me-2.5'} text-[#07571C]`} strokeWidth={2.5} /> 
          {isUrdu ? 'آنے والے اقدامات' : 'Upcoming Actions'}
        </h3>
        <span className="text-[12px] font-black tracking-wide text-forest bg-forest/10 px-3 py-1 rounded-full uppercase">
          {isUrdu ? 'اے آئی تجویز کردہ' : 'AI Recommended'}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {tasks.map(task => (
          <div 
            key={task.id} 
            className={`flex items-start gap-4 p-4 rounded-xl border border-earth/50 transition-all duration-300 cursor-pointer group ${completedTasks[task.id] ? 'opacity-50 hover:opacity-70 bg-earth/10' : 'hover:bg-forest/5 hover:border-forest/30 bg-white shadow-sm'}`}
            onClick={() => toggleTask(task.id)}
          >
            {/* Custom Checkbox */}
            <div 
              className={`flex-shrink-0 w-[22px] h-[22px] mt-0.5 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                completedTasks[task.id] 
                  ? 'bg-forest border-forest text-white' 
                  : 'border-charcoal/20 bg-white group-hover:border-forest/60 shadow-sm'
              }`}
            >
              <Check className={`w-3.5 h-3.5 transition-transform duration-300 ${completedTasks[task.id] ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} strokeWidth={4} />
            </div>
            
            <div className="flex-1">
              <h4 className={`text-[15px] font-bold tracking-tight transition-all duration-300 ${completedTasks[task.id] ? 'text-charcoal/60 line-through' : 'text-charcoal group-hover:text-forest'}`}>
                {task.title}
              </h4>
              <div className="flex items-center justify-between gap-2.5 mt-1.5 w-full">
                 <div className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-[6px] ${task.bgColor} ${task.color}`}>
                   <task.icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                   {task.category}
                 </div>
                 <span className="text-[12px] font-bold text-charcoal/70">
                   {task.time}
                 </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
