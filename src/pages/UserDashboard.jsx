import { 
  CloudRain, Thermometer, Wind, Droplets, ArrowRight, Sprout, Activity, BookOpen, Clock, History, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const weatherForecast = [
  { day: 'Today', temp: '32°C', icon: Thermometer, condition: 'Sunny' },
  { day: 'Tomorrow', temp: '29°C', icon: CloudRain, condition: 'Rain Expected' },
  { day: 'Wed', temp: '30°C', icon: Wind, condition: 'Breezy' },
];

const MOCK_RECENT_ACTIVITY = [
  { id: 1, type: 'Seed Intelligence', title: 'BARI-2016 Viability Check', date: '2 hours ago', status: 'Healthy' },
  { id: 2, type: 'Disease Intelligence', title: 'Leaf Spot Detection', date: 'Yesterday', status: 'High Risk' },
  { id: 3, type: 'Seed Intelligence', title: 'Golden Peanut Assessment', date: '3 days ago', status: 'Moderate' },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">{t('dashboard.welcome', { name: user?.name || 'Farmer' })}</h1>
          <p className="text-green-100 max-w-xl">{t('dashboard.farmIntro', { location: user?.location || 'the Pothwar region' })}</p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
          <Sprout className="w-64 h-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weather Widget */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <CloudRain className="w-5 h-5 mr-2 text-blue-500" /> {t('dashboard.weather')}
          </h3>
          <div className="space-y-4">
            {weatherForecast.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 w-20">{day.day}</span>
                <div className="flex items-center space-x-2">
                  <day.icon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-bold text-gray-900">{day.temp}</span>
                </div>
                <span className="text-sm text-gray-500 text-right w-28">{day.condition}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Advisory */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-red-500" /> {t('dashboard.latestAdvisory')}
          </h3>
          <div className="bg-red-50 border border-red-100 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-2">
                  {t('dashboard.highPriority')}
                </span>
                <h4 className="text-lg font-bold text-red-900">Heavy Rain Warning</h4>
                <p className="mt-2 text-sm text-red-800">
                  Meteorological data suggests heavy rainfall in your region over the next 48 hours. Ensure proper drainage in your peanut fields to prevent waterlogging and root rot.
                </p>
              </div>
              <span className="text-xs text-red-500 flex items-center whitespace-nowrap flex-shrink-0 ml-4">
                <Clock className="w-3 h-3 mr-1" /> 2 hours ago
              </span>
            </div>
            <button className="mt-4 text-sm font-medium text-red-700 hover:text-red-900 flex items-center cursor-pointer">
              {t('dashboard.readMore')} <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Widget */}
      <h2 className="text-xl font-bold text-gray-900 pt-4 flex items-center">
        <History className="w-6 h-6 mr-2 text-emerald-600" /> {t('dashboard.recentActivity')}
      </h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-4">
          {MOCK_RECENT_ACTIVITY.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100 border-dashed">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className={`p-3 rounded-full flex-shrink-0 ${item.type === 'Seed Intelligence' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  {item.type === 'Seed Intelligence' ? <Sprout className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <div className="flex items-center text-xs text-slate-500 mt-1 space-x-2 rtl:space-x-reverse">
                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" /> {item.date}</span>
                    <span>•</span>
                    <span>{item.type}</span>
                  </div>
                </div>
              </div>
              <div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                  item.status === 'Healthy' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                  item.status === 'High Risk' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                  'bg-amber-100 text-amber-700 border-amber-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 rtl:mr-0 rtl:ml-1.5 ${
                    item.status === 'Healthy' ? 'bg-emerald-500' :
                    item.status === 'High Risk' ? 'bg-rose-500' :
                    'bg-amber-500'
                  }`}></span>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
          <Link to="/user/history" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
            {t('dashboard.viewAllHistory')}
          </Link>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 pt-4">{t('dashboard.quickActions')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <Link to="/user/seed" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:shadow-emerald-500/20 hover:border-green-300 transition-all group block cursor-pointer">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
            <Sprout className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t('dashboard.seedQuality')}</h3>
          <p className="text-sm text-gray-500">{t('dashboard.seedDesc')}</p>
        </Link>

        <Link to="/user/disease" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:shadow-emerald-500/20 hover:border-blue-300 transition-all group block cursor-pointer">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t('dashboard.diseaseId')}</h3>
          <p className="text-sm text-gray-500">{t('dashboard.diseaseDesc')}</p>
        </Link>

        <Link to="/user/knowledge-base" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:shadow-emerald-500/20 hover:border-purple-300 transition-all group block cursor-pointer">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t('dashboard.knowledgeBase')}</h3>
          <p className="text-sm text-gray-500">{t('dashboard.kbDesc')}</p>
        </Link>

      </div>
    </div>
  );
}
