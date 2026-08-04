import { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { Sprout, Activity, AlertTriangle, Users, Loader2, X } from 'lucide-react';

const diseaseData = [
  { name: 'Jan', EarlyLeafSpot: 40, LateLeafSpot: 24, CollarRot: 24 },
  { name: 'Feb', EarlyLeafSpot: 30, LateLeafSpot: 13, CollarRot: 22 },
  { name: 'Mar', EarlyLeafSpot: 20, LateLeafSpot: 58, CollarRot: 29 },
  { name: 'Apr', EarlyLeafSpot: 27, LateLeafSpot: 39, CollarRot: 20 },
  { name: 'May', EarlyLeafSpot: 18, LateLeafSpot: 48, CollarRot: 21 },
  { name: 'Jun', EarlyLeafSpot: 23, LateLeafSpot: 38, CollarRot: 25 },
  { name: 'Jul', EarlyLeafSpot: 34, LateLeafSpot: 43, CollarRot: 21 },
];

const yieldData = [
  { name: 'Attock', yield: 4000 },
  { name: 'Chakwal', yield: 3000 },
  { name: 'Talagang', yield: 2000 },
  { name: 'Rawalpindi', yield: 2780 },
];

const StatCard = ({ title, value, icon: Icon, trend, trendUp }) => (
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
      <span className="ml-2 text-sm text-slate-500">vs last month</span>
    </div>
  </div>
);

export default function Dashboard() {
  const [isExporting, setIsExporting] = useState(false);
  const [isAdvisoryModalOpen, setIsAdvisoryModalOpen] = useState(false);

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
    alert('New advisory broadcasted to all active farmers in the selected region.');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <div className="flex space-x-3">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center cursor-pointer disabled:opacity-70"
          >
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isExporting ? 'Exporting...' : 'Export Report'}
          </button>
          <button 
            onClick={() => setIsAdvisoryModalOpen(true)}
            className="px-4 py-2 bg-green-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-green-700 cursor-pointer"
          >
            New Advisory
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Farmers" value="12,345" icon={Users} trend="+12%" trendUp={true} />
        <StatCard title="Seed Analyses" value="8,432" icon={Sprout} trend="+5.4%" trendUp={true} />
        <StatCard title="Disease Detections" value="3,211" icon={Activity} trend="-2.1%" trendUp={false} />
        <StatCard title="Outbreak Alerts" value="14" icon={AlertTriangle} trend="+3" trendUp={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg hover:shadow-emerald-500/20 transition-shadow duration-300">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Disease Progression Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={diseaseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.4} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="EarlyLeafSpot" stackId="1" stroke="#10b981" fill="url(#colorEarly)" fillOpacity={0.8} />
                <Area type="monotone" dataKey="LateLeafSpot" stackId="1" stroke="#14b8a6" fill="url(#colorLate)" fillOpacity={0.8} />
                <Area type="monotone" dataKey="CollarRot" stackId="1" stroke="#334155" fill="url(#colorCollar)" fillOpacity={0.8} />
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
          <h3 className="text-lg font-bold text-slate-900 mb-6">Regional Yield Forecast (kg/acre)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yieldData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#cbd5e1" opacity={0.4} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#334155', fontWeight: 600}} width={90} />
                <Tooltip 
                  cursor={{fill: 'rgba(241,245,249,0.5)'}}
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="yield" fill="#10b981" radius={[0, 8, 8, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg hover:shadow-emerald-500/20 transition-shadow duration-300">
        <div className="px-8 py-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-slate-900">Recent Platform Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Farmer</th>
                <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Region</th>
                <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Activity Type</th>
                <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {[
                { name: 'Ahmad Khan', region: 'Attock', type: 'Seed Quality Scan', status: 'Completed', statusColor: 'bg-emerald-100 text-emerald-800', time: '5 mins ago' },
                { name: 'Muhammad Ali', region: 'Chakwal', type: 'Disease Analysis', status: 'High Risk', statusColor: 'bg-rose-100 text-rose-800', time: '12 mins ago' },
                { name: 'Usman Tariq', region: 'Rawalpindi', type: 'Voice Advisory', status: 'Completed', statusColor: 'bg-emerald-100 text-emerald-800', time: '1 hour ago' },
                { name: 'Zainab Bibi', region: 'Talagang', type: 'Profile Update', status: 'Pending', statusColor: 'bg-amber-100 text-amber-800', time: '2 hours ago' },
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
            <h3 className="text-lg font-bold text-gray-900">Broadcast Advisory</h3>
            <button onClick={() => setIsAdvisoryModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5"/></button>
          </div>
          <form onSubmit={handleSendAdvisory} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Region</label>
              <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
                <option value="All">All Regions (Pothwar)</option>
                <option value="Attock">Attock</option>
                <option value="Chakwal">Chakwal</option>
                <option value="Rawalpindi">Rawalpindi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Advisory Title</label>
              <input type="text" required placeholder="e.g., Heavy Rain Warning" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea required rows={4} placeholder="Type your advisory message here..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"></textarea>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <p className="text-xs text-yellow-800">This advisory will be immediately sent to farmers' dashboards and optionally via SMS based on their preferences.</p>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsAdvisoryModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium cursor-pointer">Broadcast Now</button>
            </div>
          </form>
        </div>
      </div>
    )}

    </div>
  );
}
