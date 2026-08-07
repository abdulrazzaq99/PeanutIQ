import { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Users, Bean, ScanSearch, AlertTriangle, Loader2, X, MapPin, Mic, BookOpen, Database, Server, Activity, MessageSquare, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { MapContainer, TileLayer, Marker, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import farmBannerBg from '../assets/farm-banner-bg.png';
import Logo from '../components/Logo';

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

const getAiData = (t) => [
  { name: t('admin.dashboard.voiceLabel'), value: 75, color: '#07571C' },
  { name: t('admin.dashboard.textInteractionsLabel'), value: 25, color: '#E07A5F' }
];

const getTrendingQueries = (t) => [
  t('admin.dashboard.trendingQuery1'),
  t('admin.dashboard.trendingQuery2'),
  t('admin.dashboard.trendingQuery3')
];

const getTopArticles = (t) => [
  { 
    title: t('admin.dashboard.article1Title'), 
    views: "1.2k",
    category: t('admin.dashboard.catCultivation'),
    author: t('admin.dashboard.authorFaisal'),
    date: "Aug 1, 2026",
    summary: t('admin.dashboard.article1Summary'),
    content: t('admin.dashboard.article1Content')
  },
  { 
    title: t('admin.dashboard.article2Title'), 
    views: "956",
    category: t('admin.dashboard.catDisease'),
    author: t('admin.dashboard.authorAhmed'),
    date: "Jul 15, 2026",
    summary: t('admin.dashboard.article2Summary'),
    content: t('admin.dashboard.article2Content')
  },
  { 
    title: t('admin.dashboard.article3Title'), 
    views: "840",
    category: t('admin.dashboard.catHarvesting'),
    author: t('admin.dashboard.authorAli'),
    date: "Sep 5, 2026",
    summary: t('admin.dashboard.article3Summary'),
    content: t('admin.dashboard.article3Content')
  },
  { 
    title: t('admin.dashboard.article4Title'), 
    views: "612",
    category: t('admin.dashboard.catSoil'),
    author: t('admin.dashboard.authorFaisal'),
    date: "Jun 20, 2026",
    summary: t('admin.dashboard.article4Summary'),
    content: t('admin.dashboard.article4Content')
  }
];

const getTheme = (color) => {
  switch (color) {
    case 'blue': return { bg: 'bg-blue-50/40 hover:bg-blue-50/80', border: 'border-blue-100 hover:border-blue-200', iconBg: 'bg-blue-100/30 text-blue-500' };
    case 'green': return { bg: 'bg-emerald-50/40 hover:bg-forest/10/80', border: 'border-emerald-100 hover:border-emerald-200', iconBg: 'bg-emerald-100/30 text-forest' };
    case 'amber': return { bg: 'bg-amber-50/40 hover:bg-amber-50/80', border: 'border-amber-100 hover:border-amber-200', iconBg: 'bg-amber-100/30 text-amber-500' };
    case 'red': return { bg: 'bg-rose-50/40 hover:bg-rose-50/80', border: 'border-rose-100 hover:border-rose-200', iconBg: 'bg-rose-100/30 text-rose-500' };
    default: return { bg: 'bg-sand hover:bg-forest/10 hover:text-forest hover:border-transparent', border: 'border-gray-200 hover:border-gray-300', iconBg: 'bg-white text-gray-500' };
  }
}


const createMarkerIcon = (type) => {
  const isDisease = type === 'disease';
  const bgColor = isDisease ? 'bg-[#f43f5e]' : 'bg-[#0ea5e9]';
  const pulseColor = isDisease ? 'bg-[#f43f5e]' : 'bg-[#0ea5e9]';
  
  const html = `
    <div class="relative flex items-center justify-center w-full h-full">
      <div class="absolute w-12 h-12 rounded-full ${pulseColor} opacity-20 animate-pulse"></div>
      <div class="absolute w-4 h-4 rounded-full ${bgColor} shadow-sm z-10"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-marker',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24]
  });
};

const diseaseIcon = createMarkerIcon('disease');
const farmerIcon = createMarkerIcon('farmer');

const StatCard = ({ title, value, icon: Icon, trend, trendUp, colorTheme }) => {
  const { t } = useTranslation();
  const theme = getTheme(colorTheme);

  return (
  <div className={`border rounded-2xl p-5 md:p-6 shadow-sm transition-all flex flex-col h-full ${theme.bg} ${theme.border}`}>
    <div className="flex items-start justify-between mb-8">
      <div className={`p-3 rounded-xl ${theme.iconBg}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex flex-col items-end">
        <div className={`px-2.5 py-1 rounded-full border bg-white flex items-center shadow-sm ${trendUp ? 'text-forest border-emerald-100' : 'text-rose-600 border-rose-100'}`} dir="ltr">
          <span className="text-[12px] font-bold">{trend}</span>
        </div>
        <span className="text-[11.5px] font-bold text-gray-500 mt-1.5">{t('admin.dashboard.vsLastMonth')}</span>
      </div>
    </div>
    
    <div className="flex flex-col items-start mt-auto">
      <h3 className="text-[32px] font-black text-gray-900 tracking-tight leading-none mb-1.5">{value}</h3>
      <p className="text-[14px] font-bold text-gray-500">{title}</p>
    </div>
  </div>
  );
};

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isAdvisoryModalOpen, setIsAdvisoryModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
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
    showToast(t('admin.dashboard.broadcastSuccess', { region: targetRegion }).replace('{region}', targetRegion), '', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4 md:gap-6 pb-10">
      
      {/* 1. Welcome Banner */}
      <div className="relative rounded-[2rem] py-6 md:py-8 px-6 md:px-10 overflow-hidden text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between bg-[#0F5A27] gap-6">
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
          <h1 className="text-3xl font-bold mb-2 flex items-center tracking-tight text-white">
            {t('admin.dashboard.title')}
            <Logo className="w-8 h-8 ms-4" iconColor="#ffffff" sparkleColor="#A3D977" />
          </h1>
          <p className="text-green-50 max-w-xl text-base opacity-90 leading-relaxed mt-2">
            Monitor overall platform activity and intelligence metrics.
          </p>
        </div>

        <div className="relative z-10 flex gap-3">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-bold text-white hover:bg-white/20 flex items-center cursor-pointer disabled:opacity-70 transition-colors shadow-sm"
          >
            {isExporting ? <Loader2 className="w-4 h-4 rtl:ml-2 ltr:mr-2 animate-spin" /> : null}
            {isExporting ? t('admin.dashboard.exporting') : t('admin.dashboard.exportReport')}
          </button>
          <button 
            onClick={() => setIsAdvisoryModalOpen(true)}
            className="px-4 py-2 bg-[#A3D977] text-[#0F5A27] rounded-lg text-sm font-bold hover:bg-[#8bc95c] cursor-pointer shadow-sm transition-colors"
          >
            {t('admin.dashboard.newAdvisory')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('admin.dashboard.activeFarmers')} value="12,345" icon={Users} trend="+12%" trendUp={true} colorTheme="blue" />
        <StatCard title={t('admin.dashboard.seedAnalyses')} value="8,432" icon={Bean} trend="+5.4%" trendUp={true} colorTheme="green" />
        <StatCard title={t('admin.dashboard.diseaseDetections')} value="3,211" icon={ScanSearch} trend="-2.1%" trendUp={false} colorTheme="amber" />
        <StatCard title={t('admin.dashboard.outbreakAlerts')} value="14" icon={AlertTriangle} trend="+3" trendUp={false} colorTheme="red" />
      </div>

      {/* 2. {t('admin.dashboard.regionalIntelligenceTitle')} Map */}
      <div className="bg-white border border-earth rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center tracking-tight">
              <MapPin className="w-6 h-6 text-sky-500 rtl:ml-2 ltr:mr-2" />
              {t('admin.dashboard.regionalIntelligenceTitle')}
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-1">{t('admin.dashboard.regionalIntelligenceSubtitle')}</p>
          </div>
          <span className="px-4 py-1.5 bg-sky-50/80 text-sky-600 text-xs font-bold rounded-full border border-sky-100 shadow-sm flex items-center">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse ltr:mr-2 rtl:ml-2"></span>
            {t('admin.dashboard.liveFeed')}
          </span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-auto lg:h-[320px]">
          {/* Real Interactive Map */}
          <div className="lg:col-span-3 rounded-2xl relative overflow-hidden p-0 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] h-[320px] z-0">
            <style>
              {`
                .leaflet-tooltip.custom-tooltip {
                  background: transparent;
                  border: none;
                  box-shadow: none;
                  font-weight: 700;
                  color: #ffffff;
                  text-shadow: 0 1px 4px rgba(0,0,0,0.8);
                  font-size: 13px;
                  font-family: inherit;
                  padding: 0;
                  margin: 0;
                }
                .leaflet-tooltip-top:before,
                .leaflet-tooltip-bottom:before,
                .leaflet-tooltip-left:before,
                .leaflet-tooltip-right:before {
                  display: none;
                }
              `}
            </style>
            <MapContainer 
              center={[33.2, 72.7]} 
              zoom={8} 
              style={{ height: '100%', width: '100%', zIndex: 0 }}
              zoomControl={false}
              attributionControl={false}
              dragging={true}
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              />
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              />
              <Marker position={[33.7660, 72.3609]} icon={diseaseIcon}>
                <LeafletTooltip direction="bottom" offset={[0, 10]} opacity={1} permanent className="custom-tooltip">
                  {t('admin.dashboard.attock')}
                </LeafletTooltip>
              </Marker>
              <Marker position={[33.5973, 73.0479]} icon={farmerIcon}>
                <LeafletTooltip direction="bottom" offset={[0, 10]} opacity={1} permanent className="custom-tooltip">
                  {t('admin.dashboard.rawalpindi')}
                </LeafletTooltip>
              </Marker>
              <Marker position={[32.9328, 72.8630]} icon={diseaseIcon}>
                <LeafletTooltip direction="bottom" offset={[0, 10]} opacity={1} permanent className="custom-tooltip">
                  {t('admin.dashboard.chakwal')}
                </LeafletTooltip>
              </Marker>
              <Marker position={[32.9297, 72.4150]} icon={farmerIcon}>
                <LeafletTooltip direction="bottom" offset={[0, 10]} opacity={1} permanent className="custom-tooltip">
                  {t('admin.dashboard.talagang')}
                </LeafletTooltip>
              </Marker>
            </MapContainer>
            
            {/* Soft Overlays */}
            <div className="absolute bottom-6 right-6 z-[400] pointer-events-none">
              <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200/60 flex flex-col gap-3 min-w-[140px]">
                <div className="flex items-center gap-2.5 text-[10px] font-bold tracking-wider uppercase text-slate-700">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-3 h-3 rounded-full bg-sky-400/40 animate-ping"></span>
                    <span className="relative w-2 h-2 rounded-full bg-sky-500 shadow-sm"></span>
                  </div>
                  <span>{t('admin.dashboard.activeFarmersLabel')}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[10px] font-bold tracking-wider uppercase text-slate-700">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-3 h-3 rounded-full bg-rose-400/40 animate-ping"></span>
                    <span className="relative w-2 h-2 rounded-full bg-rose-500 shadow-sm"></span>
                  </div>
                  <span>{t('admin.dashboard.diseaseHotspotsLabel')}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Data details - Humanized */}
          <div className="lg:col-span-2 flex flex-col justify-center space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.dashboard.criticalAreaLabel')}</p>
                <span className="flex items-center px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg font-bold text-xs">
                  <TrendingUp className="w-3.5 h-3.5 rtl:ml-1 ltr:mr-1" />
                  {t('admin.dashboard.riskIncrease')}
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-1">{t('admin.dashboard.attockDistrict')}</h4>
              <p className="text-sm font-medium text-slate-600">{t('admin.dashboard.collarRotOutbreakMsg')}</p>
            </div>
            
            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.dashboard.highEngagementLabel')}</p>
                <span className="flex items-center px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg font-bold text-xs">
                  <Users className="w-3.5 h-3.5 rtl:ml-1 ltr:mr-1" />
                  {t('admin.dashboard.newFarmers')}
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-1">{t('admin.dashboard.talagang')}</h4>
              <p className="text-sm font-medium text-slate-600">{t('admin.dashboard.farmersOnboardedMsg')}</p>
            </div>
          </div>
        </div>
      </div>

            {/* AI Agent & Research Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: AI Voice Agent Usage - Humanized */}
        <div className="bg-white border border-earth rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center tracking-tight">
                <Mic className="w-6 h-6 text-indigo-500 rtl:ml-2 ltr:mr-2" />
                {t('admin.dashboard.aiAgentUsageTitle')}
              </h3>
              <p className="text-sm font-medium text-slate-500 mt-1">{t('admin.dashboard.interactionsViaCopilot')}</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center flex-1">
            <div className="w-full md:w-1/2 h-48 relative">
              {/* Center text for donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                <span className="text-2xl font-black text-slate-900">{t('admin.dashboard.tenKPlus')}</span>
                <span className="text-[11px] font-bold text-slate-500 uppercase">{t('admin.dashboard.queriesLabel')}</span>
              </div>
              <ResponsiveContainer width="100%" height="100%" className="z-10 relative">
                <PieChart>
                  <Pie
                    data={getAiData(t)}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={8}
                    cornerRadius={10}
                    dataKey="value"
                    stroke="none"
                  >
                    {getAiData(t).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', background: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    itemStyle={{ color: '#334155', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full md:w-1/2 space-y-4 mt-6 md:mt-0 md:pl-4">
              {getAiData(t).map((item, idx) => (
                <div key={idx} className="bg-sand p-4 rounded-2xl">
                  <div className="flex items-center gap- mb-1 overflow-hidden">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor: item.color}}></span>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap truncate">{item.name}</span>
                  </div>
                  <span className="text-2xl font-black text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">{t('admin.dashboard.topTrendingQueries')}</p>
            <div className="flex flex-wrap gap-2">
              {getTrendingQueries(t).map((query, idx) => (
                <div key={idx} className="bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-2xl text-sm font-bold flex items-center shadow-sm">
                  <MessageSquare className="w-4 h-4 rtl:ml-2 ltr:mr-2 opacity-70" />
                  "{query}"
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: {t('admin.dashboard.knowledgeBaseTitle')} Insights - Humanized */}
        <div className="bg-white border border-earth rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center tracking-tight">
                <BookOpen className="w-6 h-6 text-teal-600 rtl:ml-2 ltr:mr-2" />
                {t('admin.dashboard.knowledgeBaseTitle')}
              </h3>
              <p className="text-sm font-medium text-slate-500 mt-1">{t('admin.dashboard.mostReadByResearchers')}</p>
            </div>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wide">
              {t('admin.dashboard.past30Days')}
            </span>
          </div>
          
          <div className="space-y-3 flex-1">
            {getTopArticles(t).map((article, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedArticle(article)}
                className="group p-4 rounded-2xl bg-sand/50 hover:bg-teal-50 hover:shadow-sm transition-all flex justify-between items-center cursor-pointer border border-transparent hover:border-teal-200"
              >
                <div className="flex items-center gap- overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-slate-400 group-hover:text-teal-600 transition-colors flex-shrink-0 text-lg">
                    {idx + 1}
                  </div>
                  <span className="text-[15px] font-bold text-slate-800 group-hover:text-teal-900 truncate">{article.title}</span>
                </div>
                <div className="flex flex-col items-end flex-shrink-0 ltr:ml-4 rtl:mr-4">
                  <span className="text-sm font-black text-slate-800">{article.views}</span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">{t('admin.dashboard.viewsLabel')}</span>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate('/admin/knowledge-base')}
            className="mt-6 w-full py-3.5 rounded-2xl bg-sand text-sm font-bold text-slate-700 hover:bg-forest/10 hover:text-forest transition-colors cursor-pointer"
          >
            {t('admin.dashboard.exploreAllResources')}
          </button>
        </div>
      </div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-earth rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:border-forest/30 transition-colors">
          <h3 className="text-[17px] font-bold text-charcoal mb-6">{t('admin.dashboard.diseaseProgressionTrends')}</h3>
          <div className="h-80" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={diseaseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.6} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#333333', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#333333', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '2px solid #E5E7EB', background: '#F9FAFB', boxShadow: 'none' }}
                />
                <Legend iconType="square" />
                <Area type="monotone" dataKey="EarlyLeafSpot" name={t('admin.dashboard.diseases.earlyLeafSpot')} stroke="#07571C" strokeWidth={3} fill="#07571C" fillOpacity={0.1} />
                <Area type="monotone" dataKey="LateLeafSpot" name={t('admin.dashboard.diseases.lateLeafSpot')} stroke="#a0522d" strokeWidth={3} fill="#a0522d" fillOpacity={0.1} />
                <Area type="monotone" dataKey="CollarRot" name={t('admin.dashboard.diseases.collarRot')} stroke="#d97706" strokeWidth={3} fill="#d97706" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-earth rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:border-forest/30 transition-colors">
          <h3 className="text-[17px] font-bold text-charcoal mb-6">{t('admin.dashboard.regionalYieldForecast')}</h3>
          <div className="h-80" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yieldData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" opacity={0.6} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#333333', fontSize: 12}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#333333', fontWeight: 'bold', fontSize: 12}} width={90} />
                <Tooltip 
                  cursor={{fill: 'rgba(229,231,235,0.3)'}}
                  contentStyle={{ borderRadius: '8px', border: '2px solid #E5E7EB', background: '#F9FAFB', boxShadow: 'none' }}
                />
                <Bar dataKey="yield" name={t('admin.dashboard.yield', 'Yield')} fill="#07571C" radius={[0, 0, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Table */}
      <div className="bg-white border border-earth rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:border-forest/30 transition-colors overflow-hidden">
        <div className="pb-5 border-b border-earth/60 mb-4">
          <h3 className="text-[17px] font-bold text-charcoal">{t('admin.dashboard.recentActivity')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-earth/40">
            <thead className="bg-sand/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left rtl:text-right text-[12px] font-bold text-gray-600 uppercase tracking-wider">{t('admin.dashboard.farmer')}</th>
                <th scope="col" className="px-4 py-3 text-left rtl:text-right text-[12px] font-bold text-gray-600 uppercase tracking-wider">{t('admin.dashboard.region')}</th>
                <th scope="col" className="px-4 py-3 text-left rtl:text-right text-[12px] font-bold text-gray-600 uppercase tracking-wider">{t('admin.dashboard.activityType')}</th>
                <th scope="col" className="px-4 py-3 text-center text-[12px] font-bold text-gray-600 uppercase tracking-wider">{t('admin.dashboard.status')}</th>
                <th scope="col" className="px-4 py-3 text-left rtl:text-right text-[12px] font-bold text-gray-600 uppercase tracking-wider">{t('admin.dashboard.time')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth/40 bg-white">
              {[
                { name: t('admin.dashboard.names.ahmad'), region: t('admin.dashboard.attock'), type: t('admin.dashboard.activityTypes.seedScan'), status: t('admin.dashboard.statuses.completed'), statusColor: 'bg-green-100 text-[#07571C]', time: t('admin.dashboard.times.min5') },
                { name: t('admin.dashboard.names.ali'), region: t('admin.dashboard.chakwal'), type: t('admin.dashboard.activityTypes.diseaseAnalysis'), status: t('admin.dashboard.statuses.highRisk'), statusColor: 'bg-red-100 text-red-700', time: t('admin.dashboard.times.min12') },
                { name: t('admin.dashboard.names.usman'), region: t('admin.dashboard.rawalpindi'), type: t('admin.dashboard.activityTypes.voiceAdvisory'), status: t('admin.dashboard.statuses.completed'), statusColor: 'bg-green-100 text-[#07571C]', time: t('admin.dashboard.times.hour1') },
                { name: t('admin.dashboard.names.zainab'), region: t('admin.dashboard.talagang'), type: t('admin.dashboard.activityTypes.profileUpdate'), status: t('admin.dashboard.statuses.pending'), statusColor: 'bg-amber-100 text-amber-700', time: t('admin.dashboard.times.hour2') },
              ].map((person, personIdx) => (
                <tr key={personIdx} className="hover:bg-forest/5 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap text-[14px] font-bold text-charcoal">{person.name}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-[13px] font-medium text-charcoal/70">{person.region}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-[13px] font-medium text-charcoal/70">{person.type}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-[13px]">
                    <span className={`w-24 justify-center text-center px-2.5 py-1 inline-flex text-[11px] font-bold rounded-full ${person.statusColor}`}>
                      {person.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[13px] text-charcoal/70 font-medium">{person.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* {t('admin.dashboard.systemHealthTitle')} - Humanized */}
      <div className="bg-white border border-earth rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] mb-8">
        <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center tracking-tight">
          <Activity className="w-6 h-6 text-slate-500 rtl:ml-2 ltr:mr-2" />
          {t('admin.dashboard.systemHealthTitle')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Metric 1 */}
          <div className="flex flex-col">
            <div className="flex items-center gap- mb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center">
                <Server className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">{t('admin.dashboard.serverUptime')}</div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Global Nodes</div>
              </div>
            </div>
            <div className="flex justify-between items-end mb-2 mt-auto">
              <span className="text-2xl font-black text-slate-900">99.9%</span>
              <p className="text-[11px] font-bold text-teal-700 mb-1">{t('admin.dashboard.healthy')}</p>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: '99.9%' }}></div>
            </div>
          </div>
          
          {/* Metric 2 */}
          <div className="flex flex-col">
            <div className="flex items-center gap- mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                <Mic className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">{t('admin.dashboard.aiApiUsage')}</div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Monthly Quota</div>
              </div>
            </div>
            <div className="flex justify-between items-end mb-2 mt-auto">
              <span className="text-2xl font-black text-slate-900">85%</span>
              <p className="text-[11px] font-bold text-amber-700 mb-1">{t('admin.dashboard.approaching')}</p>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
          
          {/* Metric 3 */}
          <div className="flex flex-col">
            <div className="flex items-center gap- mb-4">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center">
                <Database className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">{t('admin.dashboard.databaseStorage')}</div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Cluster Alpha</div>
              </div>
            </div>
            <div className="flex justify-between items-end mb-2 mt-auto">
              <span className="text-2xl font-black text-slate-900">42%</span>
              <p className="text-[11px] font-bold text-sky-700 mb-1">{t('admin.dashboard.optimal')}</p>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full" style={{ width: '42%' }}></div>
            </div>
          </div>
        </div>
      </div>

    {/* New Advisory Modal */}
    {isAdvisoryModalOpen && (
      <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center z-50 p-4 transition-all">
        <div className="flat-panel w-full max-w-md overflow-hidden bg-white">
          <div className="px-6 py-4 border-b border-earth flex justify-between items-center bg-sand">
            <h3 className="text-lg font-bold text-charcoal">{t('admin.dashboard.advisoryModalTitle')}</h3>
            <button onClick={() => setIsAdvisoryModalOpen(false)} className="text-charcoal opacity-50 hover:opacity-100 cursor-pointer"><X className="w-5 h-5"/></button>
          </div>
          <form onSubmit={handleSendAdvisory} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1">{t('admin.dashboard.targetRegion')}</label>
              <select 
                required 
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value)}
                className="w-full px-3 py-2 border-2 border-earth bg-sand rounded-lg focus:outline-none focus:border-forest text-charcoal"
              >
                <option value="All">{t('admin.dashboard.allRegions')}</option>
                <option value="Attock">{t('admin.dashboard.attock')}</option>
                <option value="Chakwal">{t('admin.dashboard.chakwal')}</option>
                <option value="Rawalpindi">{t('admin.dashboard.rawalpindi')}</option>
                <option value="{t('admin.dashboard.talagang')}">{t('admin.dashboard.talagang')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1">{t('admin.dashboard.advisoryTitleLabel')}</label>
              <input type="text" required placeholder={t('admin.dashboard.advisoryTitlePlaceholder')} className="w-full px-3 py-2 border-2 border-earth bg-sand rounded-lg focus:outline-none focus:border-forest text-charcoal" />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1">{t('admin.dashboard.messageLabel')}</label>
              <textarea required rows={4} placeholder={t('admin.dashboard.messagePlaceholder')} className="w-full px-3 py-2 border-2 border-earth bg-sand rounded-lg focus:outline-none focus:border-forest text-charcoal"></textarea>
            </div>
            <div className="bg-sand border-2 border-terracotta p-3 rounded-lg flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-terracotta flex-shrink-0" />
              <p className="text-xs text-charcoal font-bold">{t('admin.dashboard.advisoryWarning')}</p>
            </div>
            <div className="flex justify-end gap- pt-4 border-t border-earth">
              <button type="button" onClick={() => setIsAdvisoryModalOpen(false)} className="px-4 py-2 bg-sand border-2 border-earth text-charcoal rounded-lg hover:bg-forest/10 hover:text-forest hover:border-transparent font-bold cursor-pointer">{t('admin.dashboard.cancel')}</button>
              <button type="submit" className="btn-primary px-4 py-2 text-sm cursor-pointer">{t('admin.dashboard.broadcastNow')}</button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Article Modal */}
    {selectedArticle && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-12 bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[80vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{t('admin.dashboard.knowledgeBaseTitle')}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{selectedArticle.views} Views</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedArticle(null)}
              className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-slate-400 hover:bg-forest/10 hover:text-forest transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="px-8 py-6 overflow-y-auto flex-1 min-h-0">
            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center gap-3 text-[13px] mb-6">
              <span className="px-3 py-1 bg-emerald-50 text-forest font-bold rounded-full uppercase tracking-wide">
                {selectedArticle.category}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center text-slate-500 font-medium">
                <BookOpen className="w-4 h-4 rtl:ml-1.5 ltr:mr-1.5 opacity-70" />
                {selectedArticle.author}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium">{selectedArticle.date}</span>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-6 leading-tight">{selectedArticle.title}</h2>
            
            <div className="border-l-4 border-slate-200 rtl:border-r-4 rtl:border-l-0 pl-5 rtl:pr-5 rtl:pl-0 mb-8 py-1">
              <p className="text-lg italic text-slate-600 leading-relaxed font-medium">
                {selectedArticle.summary}
              </p>
            </div>

            <div className="prose prose-slate prose-teal max-w-none prose-p:mb-0">
              <p className="text-slate-700 text-lg leading-[1.8] mb-0">
                {selectedArticle.content}
              </p>
            </div>
          </div>
          

        </div>
      </div>
    )}

    </div>
  );
}
