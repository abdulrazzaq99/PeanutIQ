import React, { useState, useEffect } from 'react';
import { 
  CloudRain, Thermometer, Wind, Droplets, ArrowRight, Wheat, Bean, ScanSearch, BookOpen, Clock, History, Calendar, AlertTriangle, Leaf, Activity, ClipboardList, BarChart3, MessageSquare, Sun
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import farmBannerBg from '../assets/farm-banner-bg.png';
import Logo from '../components/Logo';
import CropLifecycle from '../components/CropLifecycle';
import DailyAITip from '../components/DailyAITip';
import UpcomingActions from '../components/UpcomingActions';
import { fetchApi } from '../config/api';
import { formatDate } from '../utils/date';

const weatherForecast = [
  { dayKey: 'dashboard.weatherData.today', temp: '32°C', icon: Thermometer, conditionKey: 'dashboard.weatherData.sunny', color: 'text-amber-500' },
  { dayKey: 'dashboard.weatherData.tomorrow', temp: '29°C', icon: CloudRain, conditionKey: 'dashboard.weatherData.rainExpected', color: 'text-blue-500' },
  { dayKey: 'dashboard.weatherData.wed', temp: '30°C', icon: Wind, conditionKey: 'dashboard.weatherData.breezy', color: 'text-teal-500' },
];

const quickActions = [
  { icon: Bean, labelKey: 'dashboard.seedQuality', bg: 'bg-green-50', text: 'text-forest', link: '/user/seed' },
  { icon: ScanSearch, labelKey: 'dashboard.diseaseId', bg: 'bg-blue-50', text: 'text-blue-600', link: '/user/disease' },
  { icon: BookOpen, labelKey: 'dashboard.knowledgeBase', bg: 'bg-teal-50', text: 'text-teal-600', link: '/user/knowledge-base' },
];

const getTimeAgo = (dateString) => {
  if (!dateString) return '';
  
  let dtString = dateString;
  if (typeof dtString === 'string' && !dtString.endsWith('Z')) {
    dtString += 'Z';
  }
  
  const date = new Date(dtString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
};

export default function UserDashboard() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  
  const [activities, setActivities] = useState([]);
  const [advisory, setAdvisory] = useState(null);
  const [cropProfile, setCropProfile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('peanutiq_token');
      if (!token) return;

      try {
        const actRes = await fetchApi('/dashboard/activities?limit=5', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (actRes.ok) setActivities(await actRes.json());

        const advRes = await fetchApi('/dashboard/advisories?type=alert&limit=1', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (advRes.ok) {
          const data = await advRes.json();
          if (data.length > 0) setAdvisory(data[0]);
        }

        const profileRes = await fetchApi('/dashboard/crop-profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (profileRes.ok) setCropProfile(await profileRes.json());
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);
  
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4 pb-10">
      
      {/* 1. Welcome Banner */}
      <div className="relative rounded-2xl p-4 px-6 overflow-hidden text-white shadow-sm flex items-center bg-[#0F5A27]">
        {/* Background Image Container */}
        <div 
          className="absolute inset-0 z-0 opacity-100 rtl:scale-x-[-1]"
          style={{
            backgroundImage: `url(${farmBannerBg})`,
            backgroundPosition: 'right center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-xl font-bold mb-1 flex items-center tracking-tight text-white">
            {t('dashboard.welcome', { name: user?.name || 'Returning Farmer' })}
            <Logo className="w-6 h-6 ms-3" iconColor="#ffffff" sparkleColor="#A3D977" />
          </h1>
          <p className="text-green-50 max-w-xl text-[13px] opacity-90 leading-tight">
            {t('dashboard.farmIntro', { location: user?.farm_location || t('dashboard.defaultLocation', 'Attock, Punjab') })}
          </p>
        </div>
      </div>

      {/* 2. Daily AI Tip */}
      <DailyAITip />

      {/* Upcoming Actions */}
      <div className="flex flex-col">
         <UpcomingActions />
      </div>

      {/* 3. Status Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* Weather Card */}
        <div className="bg-white border border-earth rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col h-full hover:border-forest/30 transition-colors">
          <h3 className="text-[17px] font-bold text-charcoal flex items-center">
            <CloudRain className="w-5 h-5 me-2.5 text-[#07571C]" strokeWidth={2.5} /> 
            {t('dashboard.weather', 'Weather Forecast')}
          </h3>
          
          <div className="flex flex-col items-center justify-center mt-4 mb-3 flex-1">
             <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-3">
               <Sun className="w-8 h-8 text-amber-500" strokeWidth={2} />
             </div>
             <span className="text-4xl font-black text-charcoal tracking-tight">32°C</span>
             <span className="text-[13px] font-bold text-charcoal/70 mt-1 uppercase tracking-wider">{t('dashboard.weatherData.sunny', 'Sunny')}</span>
          </div>

          <div className="flex flex-col justify-end space-y-4 pt-5 border-t border-earth/60">
            {weatherForecast.slice(1).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between px-2">
                <span className="text-[13px] font-bold text-charcoal/70 text-start w-16">{t(item.dayKey)}</span>
                <div className="flex items-center justify-center">
                   <item.icon className={`w-4 h-4 me-2.5 ${item.color}`} />
                   <span className="font-bold text-charcoal text-[15px]">{item.temp}</span>
                </div>
                <span className="text-[13px] font-medium text-charcoal/70 text-end whitespace-nowrap w-24">{t(item.conditionKey)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Advisory Card */}
        <div className="bg-white border border-earth rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col h-full hover:border-forest/30 transition-colors">
          <div className="flex justify-between items-start mb-4 gap-2">
            <h3 className="text-[17px] font-bold text-charcoal flex items-start">
              <AlertTriangle className="w-5 h-5 me-2 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2} /> 
              <span>{t('dashboard.latestAdvisory', 'Latest Advisory')}</span>
            </h3>
            {advisory && (advisory.created_at || advisory.date) && (
              <span className="text-[12px] font-bold text-red-500 flex items-center bg-red-50 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 mt-0.5">
                <Clock className="w-3 h-3 me-1 flex-shrink-0" /> {getTimeAgo(advisory.created_at || advisory.date)}
              </span>
            )}
          </div>
          
          {advisory ? (
            <>
              <div className="mb-3">
                <span className="inline-block px-3 py-1 bg-[#FDE8E8] text-red-700 text-[11px] font-bold rounded-full">
                  {advisory.severity === 'high' ? t('dashboard.highPriority', 'High Priority') : advisory.severity}
                </span>
              </div>
              <h4 className="text-[16px] font-bold text-red-800 mb-2">{advisory.title}</h4>
              <p className="text-[13px] text-charcoal/80 leading-relaxed font-medium mb-5">
                {advisory.message}
              </p>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <span className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                <Leaf className="w-6 h-6 text-forest" />
              </span>
              <p className="text-sm font-bold text-charcoal/70">No active alerts</p>
              <p className="text-xs text-charcoal/50 mt-1">Your farm conditions are optimal.</p>
            </div>
          )}
          <Link to="/user/advisories" className="mt-auto text-[13px] font-bold text-red-500 hover:text-red-700 transition-colors inline-flex items-center w-fit">
            {t('dashboard.readMore', 'Read more details')} <ArrowRight className="w-3.5 h-3.5 ms-1" />
          </Link>
        </div>

        {/* Crop Health Overview */}
        <div className="bg-white border border-earth rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col h-full hover:border-forest/30 transition-colors">
          <h3 className="text-[17px] font-bold text-charcoal mb-4 flex items-center">
            <Wheat className="w-5 h-5 me-2.5 text-[#07571C]" strokeWidth={2.5} /> 
            {t('dashboard.cropHealthTitle', 'Crop Health Overview')}
          </h3>
          <div className="flex items-center flex-1 py-2 justify-center gap-5 mt-2">
            <div className="relative w-36 h-36 flex-shrink-0">
              <div className="w-full h-full rounded-full" style={{ background: `conic-gradient(#22c55e 0% ${cropProfile?.health_good_pct || 0}%, #eab308 ${cropProfile?.health_good_pct || 0}% ${(cropProfile?.health_good_pct || 0) + (cropProfile?.health_average_pct || 0)}%, #ef4444 ${(cropProfile?.health_good_pct || 0) + (cropProfile?.health_average_pct || 0)}% 100%)` }}>
                <div className="absolute inset-3 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                   <span className="text-[28px] font-black text-charcoal leading-none" dir="ltr">{cropProfile?.health_good_pct || 0}%</span>
                   <span className="text-[12px] font-bold text-[#07571C] mt-1 uppercase tracking-wider">{t('dashboard.good', 'Good')}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3.5 min-w-[100px]">
               <div className="flex justify-between items-center text-[13px] font-bold text-charcoal">
                 <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-forest me-2.5 shadow-sm"></div>{t('dashboard.good', 'Good')}</div> 
                 <span className="opacity-70" dir="ltr">{cropProfile?.health_good_pct || 0}%</span>
               </div>
               <div className="flex justify-between items-center text-[13px] font-bold text-charcoal">
                 <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-yellow-400 me-2.5 shadow-sm"></div>{t('dashboard.average', 'Average')}</div> 
                 <span className="opacity-70" dir="ltr">{cropProfile?.health_average_pct || 0}%</span>
               </div>
               <div className="flex justify-between items-center text-[13px] font-bold text-charcoal">
                 <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-500 me-2.5 shadow-sm"></div>{t('dashboard.poor', 'Poor')}</div> 
                 <span className="opacity-70" dir="ltr">{cropProfile?.health_poor_pct || 0}%</span>
               </div>
            </div>
          </div>
          <Link to="/user/history" className="mt-6 text-[13px] font-bold text-[#07571C] text-start hover:underline inline-flex items-center mt-auto w-fit">
            {t('dashboard.viewFullReport', 'View full report')} <ArrowRight className="w-3.5 h-3.5 ms-1" />
          </Link>
        </div>

      </div>

      {/* 4. Crop Lifecycle Stage */}
      <CropLifecycle currentStage={cropProfile?.stage} />

      {/* 5. Quick Actions */}
      <div className="bg-white border border-earth rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <h3 className="text-[17px] font-bold text-charcoal mb-6 flex items-center">
          <Activity className="w-5 h-5 me-2.5 text-[#07571C]" strokeWidth={2.5} /> 
          {t('dashboard.quickActions', 'Quick Actions')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {quickActions.map((action, idx) => (
            <Link key={idx} to={action.link} className="bg-white border border-earth/70 rounded-2xl p-5 transition-all block cursor-pointer flex flex-col text-center items-center justify-center hover:bg-forest/10 hover:border-forest/40">
              <div className={`w-12 h-12 ${action.bg} ${action.text} rounded-2xl flex items-center justify-center mb-4 shadow-sm`}>
                <action.icon className="w-6 h-6" strokeWidth={2} />
              </div>
              <h3 className="text-[14px] font-bold text-charcoal">{t(action.labelKey)}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* 6. Activity & Tasks Row */}
      <div className="flex flex-col gap-6">
        
        {/* Recent Activity */}
        <div className="flex-1 bg-white border border-earth rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[17px] font-bold text-charcoal flex items-center">
              <History className="w-5 h-5 me-2.5 text-[#07571C]" strokeWidth={2.5} /> 
              {t('dashboard.recentActivity', 'Recent Activity')}
            </h3>
            <Link to="/user/history" className="text-[13px] font-bold text-[#07571C] hover:underline inline-flex items-center">
              {t('dashboard.viewAllActivity', 'View All Activity')} <ArrowRight className="w-3.5 h-3.5 ms-1" />
            </Link>
          </div>
          
          <div className="overflow-x-auto border-t border-earth/50 -mx-6 mt-2">
            <table className="min-w-full divide-y divide-earth/40">
              <thead className="bg-sand/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left rtl:text-right text-[12px] font-bold text-gray-600 uppercase tracking-wider">{t('dashboard.activities.action', 'Action')}</th>
                  <th scope="col" className="px-6 py-3 text-left rtl:text-right text-[12px] font-bold text-gray-600 uppercase tracking-wider">{t('dashboard.activities.details', 'Details')}</th>
                  <th scope="col" className="px-6 py-3 text-left rtl:text-right text-[12px] font-bold text-gray-600 uppercase tracking-wider">{t('dashboard.activities.time', 'Time')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth/40 bg-white">
                {activities.map((activity, idx) => (
                  <tr key={idx} className="hover:bg-forest/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] font-bold text-charcoal">
                      {activity.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] font-medium text-charcoal/70">
                      {activity.details ? activity.details : <span className="opacity-50">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-charcoal/70 font-medium">
                      {formatDate(activity.timestamp, user?.timezone)}
                    </td>
                  </tr>
                ))}
                {activities.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-sm font-medium text-charcoal/60">
                      {t('dashboard.activities.noActivity', 'No recent activity.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </div>
  );
}
