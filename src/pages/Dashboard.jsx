import { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { Sprout, Activity, AlertTriangle, Users, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const getDiseaseData = (t) => [
  { name: t('admin.dashboard.months.jan'), EarlyLeafSpot: 40, LateLeafSpot: 24, CollarRot: 24 },
  { name: t('admin.dashboard.months.feb'), EarlyLeafSpot: 30, LateLeafSpot: 13, CollarRot: 22 },
  { name: t('admin.dashboard.months.mar'), EarlyLeafSpot: 20, LateLeafSpot: 58, CollarRot: 29 },
  { name: t('admin.dashboard.months.apr'), EarlyLeafSpot: 27, LateLeafSpot: 39, CollarRot: 20 },
  { name: t('admin.dashboard.months.may'), EarlyLeafSpot: 18, LateLeafSpot: 48, CollarRot: 21 },
  { name: t('admin.dashboard.months.jun'), EarlyLeafSpot: 23, LateLeafSpot: 38, CollarRot: 25 },
  { name: t('admin.dashboard.months.jul'), EarlyLeafSpot: 34, LateLeafSpot: 43, CollarRot: 21 },
];

const getYieldData = (t) => [
  { name: t('admin.dashboard.attock'), yield: 4000 },
  { name: t('admin.dashboard.chakwal'), yield: 3000 },
  { name: t('admin.dashboard.talagang'), yield: 2000 },
  { name: t('admin.dashboard.rawalpindi'), yield: 2780 },
];

const StatCard = ({ title, value, icon: Icon, trend, trendUp }) => {
  const { t } = useTranslation();
  return (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/20 group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
      </div>
      <div className="p-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm border border-white/50">
        <Icon className="w-6 h-6 text-emerald-600" />
      </div>
    </div>
    <div className="mt-6 flex items-center">
      <span className={`text-sm font-bold px-2 py-1 rounded-lg ${trendUp ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
        {trend}
      </span>
      <span className="ml-2 text-sm text-slate-500">{t('admin.dashboard.vsLastMonth')}</span>
    </div>
  </div>
  );
};

export default function Dashboard() {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [isAdvisoryModalOpen, setIsAdvisoryModalOpen] = useState(false);
  const [targetRegion, setTargetRegion] = useState('All');

  const diseaseData = getDiseaseData(t);
  const yieldData = getYieldData(t);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      window.print();
    }, 800);
  };

  const handleSendAdvisory = (e) => {
    e.preventDefault();
    setIsAdvisoryModalOpen(false);
    alert(t('admin.dashboard.broadcastSuccess', { region: targetRegion }).replace('{region}', targetRegion));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard.title')}</h1>
        <div className="flex space-x-3">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center cursor-pointer disabled:opacity-70"
          >
            {isExporting ? <Loader2 className="w-4 h-4 rtl:ml-2 ltr:mr-2 animate-spin" /> : null}
            {isExporting ? t('admin.dashboard.exporting') : t('admin.dashboard.exportReport')}
          </button>
          <button 
            onClick={() => setIsAdvisoryModalOpen(true)}
            className="px-4 py-2 bg-green-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-green-700 cursor-pointer"
          >
            {t('admin.dashboard.newAdvisory')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('admin.dashboard.activeFarmers')} value="12,345" icon={Users} trend="+12%" trendUp={true} />
        <StatCard title={t('admin.dashboard.seedAnalyses')} value="8,432" icon={Sprout} trend="+5.4%" trendUp={true} />
        <StatCard title={t('admin.dashboard.diseaseDetections')} value="3,211" icon={Activity} trend="-2.1%" trendUp={false} />
        <StatCard title={t('admin.dashboard.outbreakAlerts')} value="14" icon={AlertTriangle} trend="+3" trendUp={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg hover:shadow-emerald-500/20 transition-shadow duration-300">
          <h3 className="text-lg font-bold text-slate-900 mb-6">{t('admin.dashboard.diseaseProgressionTrends')}</h3>
          <div className="h-80" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={diseaseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.4} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="EarlyLeafSpot" name={t('admin.dashboard.diseases.earlyLeafSpot')} stackId="1" stroke="#10b981" fill="url(#colorEarly)" fillOpacity={0.8} />
                <Area type="monotone" dataKey="LateLeafSpot" name={t('admin.dashboard.diseases.lateLeafSpot')} stackId="1" stroke="#14b8a6" fill="url(#colorLate)" fillOpacity={0.8} />
                <Area type="monotone" dataKey="CollarRot" name={t('admin.dashboard.diseases.collarRot')} stackId="1" stroke="#334155" fill="url(#colorCollar)" fillOpacity={0.8} />
                <defs>
                  <linearGradient id="colorEarly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCollar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#334155" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#334155" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg hover:shadow-emerald-500/20 transition-shadow duration-300">
          <h3 className="text-lg font-bold text-slate-900 mb-6">{t('admin.dashboard.regionalYieldForecast')}</h3>
          <div className="h-80" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yieldData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#cbd5e1" opacity={0.4} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#334155', fontWeight: 600}} width={90} />
                <Tooltip 
                  cursor={{fill: 'rgba(241,245,249,0.5)'}}
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="yield" name={t('admin.dashboard.yield', 'Yield')} fill="#10b981" radius={[0, 8, 8, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg hover:shadow-emerald-500/20 transition-shadow duration-300">
        <div className="px-8 py-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-slate-900">{t('admin.dashboard.recentActivity')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-8 py-4 text-left rtl:text-right text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.dashboard.farmer')}</th>
                <th scope="col" className="px-8 py-4 text-left rtl:text-right text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.dashboard.region')}</th>
                <th scope="col" className="px-8 py-4 text-left rtl:text-right text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.dashboard.activityType')}</th>
                <th scope="col" className="px-8 py-4 text-left rtl:text-right text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.dashboard.status')}</th>
                <th scope="col" className="px-8 py-4 text-left rtl:text-right text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.dashboard.time')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {[
                { name: t('admin.dashboard.names.ahmad'), region: t('admin.dashboard.attock'), type: t('admin.dashboard.activityTypes.seedScan'), status: t('admin.dashboard.statuses.completed'), statusColor: 'bg-emerald-100 text-emerald-800', time: t('admin.dashboard.times.min5') },
                { name: t('admin.dashboard.names.ali'), region: t('admin.dashboard.chakwal'), type: t('admin.dashboard.activityTypes.diseaseAnalysis'), status: t('admin.dashboard.statuses.highRisk'), statusColor: 'bg-rose-100 text-rose-800', time: t('admin.dashboard.times.min12') },
                { name: t('admin.dashboard.names.usman'), region: t('admin.dashboard.rawalpindi'), type: t('admin.dashboard.activityTypes.voiceAdvisory'), status: t('admin.dashboard.statuses.completed'), statusColor: 'bg-emerald-100 text-emerald-800', time: t('admin.dashboard.times.hour1') },
                { name: t('admin.dashboard.names.zainab'), region: t('admin.dashboard.talagang'), type: t('admin.dashboard.activityTypes.profileUpdate'), status: t('admin.dashboard.statuses.pending'), statusColor: 'bg-amber-100 text-amber-800', time: t('admin.dashboard.times.hour2') },
              ].map((person, personIdx) => (
                <tr key={personIdx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-900">{person.name}</td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-600">{person.region}</td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-600">{person.type}</td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-lg ${person.statusColor}`}>
                      {person.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-500 font-medium">{person.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    {/* New Advisory Modal */}
    {isAdvisoryModalOpen && (
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">{t('admin.dashboard.advisoryModalTitle')}</h3>
            <button onClick={() => setIsAdvisoryModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5"/></button>
          </div>
          <form onSubmit={handleSendAdvisory} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.dashboard.targetRegion')}</label>
              <select 
                required 
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="All">{t('admin.dashboard.allRegions')}</option>
                <option value="Attock">{t('admin.dashboard.attock')}</option>
                <option value="Chakwal">{t('admin.dashboard.chakwal')}</option>
                <option value="Rawalpindi">{t('admin.dashboard.rawalpindi')}</option>
                <option value="Talagang">{t('admin.dashboard.talagang')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.dashboard.advisoryTitleLabel')}</label>
              <input type="text" required placeholder={t('admin.dashboard.advisoryTitlePlaceholder')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.dashboard.messageLabel')}</label>
              <textarea required rows={4} placeholder={t('admin.dashboard.messagePlaceholder')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"></textarea>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <p className="text-xs text-yellow-800">{t('admin.dashboard.advisoryWarning')}</p>
            </div>
            <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsAdvisoryModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium cursor-pointer">{t('admin.dashboard.cancel')}</button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium cursor-pointer">{t('admin.dashboard.broadcastNow')}</button>
            </div>
          </form>
        </div>
      </div>
    )}

    </div>
  );
}
