import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
import { Download, Bean, ScanSearch, Calendar, Search, Filter, X } from 'lucide-react';
import { fetchApi } from '../config/api';

export default function HistoryReports() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);
  const [history, setHistory] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('peanutiq_token');
      if (!token) return;
      try {
        const res = await fetchApi('/scans/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setHistory(await res.json());
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => {
    if (activeTab === 'All') return true;
    return item.type === activeTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Healthy': return { text: 'text-forest', border: 'border-emerald-200', dot: 'bg-forest' };
      case 'High Risk': return { text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' };
      case 'Moderate': return { text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' };
      default: return { text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-sand0' };
    }
  };

  const getTypeIcon = (type) => {
    return type === 'Seed Intelligence' ? <Bean className="w-4 h-4" /> : <ScanSearch className="w-4 h-4" />;
  };

  const handleDownload = (e, report) => {
    e.stopPropagation();
    if (!selectedReport) {
      setSelectedReport(report);
      setTimeout(() => {
        window.print();
      }, 100);
    } else {
      window.print();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 print:m-0">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('history.title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('history.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {['All', 'Seed Intelligence', 'Disease Intelligence'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                activeTab === tab
                  ? 'bg-forest text-white border-forest'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-forest/10 hover:text-forest hover:border-transparent'
              }`}
            >
              {tab === 'All' ? t('history.tabAll') : tab === 'Seed Intelligence' ? t('history.tabSeed') : t('history.tabDisease')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
        {filteredHistory.map((record) => (
          <div 
            key={record.id} 
            onClick={() => setSelectedReport(record)}
            className="flat-card overflow-hidden transition-shadow flex flex-col cursor-pointer hover:border-forest/30"
          >
            <div className="h-40 relative overflow-hidden bg-slate-100 flex items-center justify-center">
              <img 
                src={record.image_url} 
                alt={record.title} 
                className="absolute inset-0 w-full h-full object-cover z-10 bg-white" 
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="text-slate-400 flex flex-col items-center">
                <ScanSearch className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{t('history.imageExpired', 'Image Expired')}</span>
              </div>
              <div className="absolute top-3 end-3 z-20">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm bg-white/90 backdrop-blur-sm ${getStatusColor(record.status).text} ${getStatusColor(record.status).border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full me-1.5 ${getStatusColor(record.status).dot}`}></span>
                  {record.status === 'Healthy' ? t('history.statusHealthy') : record.status === 'High Risk' ? t('history.statusHighRisk') : t('history.statusModerate')}
                </span>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap- text-xs font-medium text-slate-500 mb-2">
                <span className="flex items-center text-forest bg-sand border border-earth px-2 py-0.5 rounded whitespace-nowrap">
                  {getTypeIcon(record.type)}
                  <span className="ms-1">{record.type === 'Seed Intelligence' ? t('history.tabSeed') : t('history.tabDisease')}</span>
                </span>
                <span className="flex items-center whitespace-nowrap flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5 me-1" />
                  {new Date(record.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-2">{record.title}</h3>
              
              <div className="mt-auto pt-4 border-t border-slate-100">
                <button 
                  onClick={(e) => handleDownload(e, record)}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-forest bg-sand border border-earth hover:bg-earth rounded-lg transition-colors group"
                >
                  <Download className="w-4 h-4 me-2 group-hover:-translate-y-0.5 transition-transform" />
                  {t('history.downloadPdf')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredHistory.length === 0 && (
        <div className="text-center py-12 flat-card border-dashed">
          <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">{t('history.noRecords')}</h3>
          <p className="text-slate-500">{t('history.tryFilters')}</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 print:static print:p-0">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm print:hidden" onClick={() => setSelectedReport(null)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative z-10 flex flex-col max-h-full print:shadow-none print:w-full print:max-w-none">
            <div className="h-48 sm:h-64 relative bg-slate-100 flex-shrink-0 print:h-64 flex items-center justify-center">
              <img 
                src={selectedReport.image_url} 
                alt={selectedReport.title} 
                className="absolute inset-0 w-full h-full object-cover z-10 bg-white" 
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="text-slate-400 flex flex-col items-center">
                <ScanSearch className="w-10 h-10 mb-3 opacity-50" />
                <span className="text-xs font-bold uppercase tracking-wider">{t('history.imageExpired', 'Image Expired')}</span>
              </div>
              <button 
                onClick={(e) => handleDownload(e, selectedReport)}
                className="absolute top-4 start-4 flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-forest/90 hover:bg-forest backdrop-blur-sm rounded-xl transition-colors shadow-sm print:hidden z-20"
              >
                <Download className="w-4 h-4 me-2" />
                {t('history.downloadPdf')}
              </button>
              <button 
                onClick={() => setSelectedReport(null)}
                className="absolute top-4 end-4 p-2 bg-white/80 hover:bg-forest/10 hover:text-forest hover:border-transparent text-slate-700 rounded-full shadow-sm backdrop-blur-sm transition-colors print:hidden z-20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap- text-sm font-medium text-slate-500">
                  <span className="flex items-center text-forest bg-sand border border-earth px-2.5 py-1 rounded-md whitespace-nowrap">
                    {getTypeIcon(selectedReport.type)}
                    <span className="ms-1.5">{selectedReport.type === 'Seed Intelligence' ? t('history.tabSeed') : t('history.tabDisease')}</span>
                  </span>
                  <span className="flex items-center whitespace-nowrap flex-shrink-0">
                    <Calendar className="w-4 h-4 me-1.5" />
                    {new Date(selectedReport.created_at).toLocaleDateString()}
                  </span>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(selectedReport.status).text} ${getStatusColor(selectedReport.status).border}`}>
                  <span className={`w-2 h-2 rounded-full me-2 ${getStatusColor(selectedReport.status).dot}`}></span>
                  {selectedReport.status === 'Healthy' ? t('history.statusHealthy') : selectedReport.status === 'High Risk' ? t('history.statusHighRisk') : t('history.statusModerate')}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{selectedReport.title}</h2>
              
              <div className="text-sm text-slate-600 mb-8 leading-relaxed">
                <p className="mb-4">{t('history.reportParagraph1')} <strong>{selectedReport.status === 'Healthy' ? t('history.statusHealthy') : selectedReport.status === 'High Risk' ? t('history.statusHighRisk') : t('history.statusModerate')}</strong> {t('history.reportClassification')}</p>
                <ul className="list-disc list-inside space-y-1.5">
                  <li>{t('history.confidenceScore')} <strong dir="ltr">{selectedReport.confidence_score}%</strong></li>
                  <li>{t('history.reportListItem1')}</li>
                  <li>{t('history.reportListItem2')}</li>
                  <li>{t('history.reportListItem3')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
