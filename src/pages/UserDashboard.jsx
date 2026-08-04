import { 
  CloudRain, Thermometer, Wind, Droplets, ArrowRight, Sprout, Activity, BookOpen, Clock 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const weatherForecast = [
  { day: 'Today', temp: '32°C', icon: Thermometer, condition: 'Sunny' },
  { day: 'Tomorrow', temp: '29°C', icon: CloudRain, condition: 'Rain Expected' },
  { day: 'Wed', temp: '30°C', icon: Wind, condition: 'Breezy' },
];

export default function UserDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Farmer'}!</h1>
          <p className="text-green-100 max-w-xl">Your farm in {user?.location || 'the Pothwar region'} is looking good. We have some new advisories and weather updates for you to check out.</p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
          <Sprout className="w-64 h-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weather Widget */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <CloudRain className="w-5 h-5 mr-2 text-blue-500" /> Weather Forecast
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
            <Activity className="w-5 h-5 mr-2 text-red-500" /> Latest Advisory
          </h3>
          <div className="bg-red-50 border border-red-100 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-2">
                  High Priority
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
              Read more details <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 pt-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <Link to="/user/seed" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:shadow-emerald-500/20 hover:border-green-300 transition-all group block cursor-pointer">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
            <Sprout className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Seed Quality Analysis</h3>
          <p className="text-sm text-gray-500">Scan your peanut seeds before sowing to ensure high germination rates.</p>
        </Link>

        <Link to="/user/disease" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:shadow-emerald-500/20 hover:border-blue-300 transition-all group block cursor-pointer">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Disease Identification</h3>
          <p className="text-sm text-gray-500">Upload photos of diseased crop leaves to get instant AI diagnosis.</p>
        </Link>

        <Link to="/user/knowledge-base" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:shadow-emerald-500/20 hover:border-purple-300 transition-all group block cursor-pointer">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Knowledge Base</h3>
          <p className="text-sm text-gray-500">Access verified agricultural research and talk to our Agentic AI.</p>
        </Link>

      </div>
    </div>
  );
}
