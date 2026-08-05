import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Sprout, Activity, Calendar, Search, Filter, X } from 'lucide-react';

const MOCK_HISTORY = [
  {
    id: 1,
    date: '2026-08-05',
    type: 'Seed Intelligence',
    titleKey: 'history.mockTitles.t1',
    status: 'Healthy',
    image: 'https://images.unsplash.com/photo-1599818815197-009772322301?auto=format&fit=crop&q=80&w=200&h=200',
  },
  {
    id: 2,
    date: '2026-08-01',
    type: 'Disease Intelligence',
    titleKey: 'history.mockTitles.t2',
    status: 'High Risk',
    image: 'https://images.unsplash.com/photo-1611181284814-1ecb7d51b3ce?auto=format&fit=crop&q=80&w=200&h=200',
  },
  {
    id: 3,
    date: '2026-07-28',
    type: 'Seed Intelligence',
    titleKey: 'history.mockTitles.t3',
    status: 'Moderate',
    image: 'https://images.unsplash.com/photo-1599818815197-009772322301?auto=format&fit=crop&q=80&w=200&h=200',
  },
  {
    id: 4,
    date: '2026-07-15',
    type: 'Disease Intelligence',
    titleKey: 'history.mockTitles.t4',
    status: 'Healthy',
    image: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=200&h=200',
  }
];

export default function HistoryReports() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);

  const filteredHistory = MOCK_HISTORY.filter(item => {
    if (activeTab === 'All') return true;
    return item.type === activeTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Healthy': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'High Risk': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Moderate': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeIcon = (type) => {
    return type === 'Seed Intelligence' ? <Sprout className="w-4 h-4" /> : <Activity className="w-4 h-4" />;
  };

  const handleDownload = (e, report) => {
    e.stopPropagation();
    alert(`${t('history.downloadingPdf', 'Downloading PDF for:')} ${t(report.titleKey)}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('history.title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('history.subtitle')}</p>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
          {['All', 'Seed Intelligence', 'Disease Intelligence'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab === 'All' ? t('history.tabAll') : tab === 'Seed Intelligence' ? t('history.tabSeed') : t('history.tabDisease')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredHistory.map((record) => (
          <div 
            key={record.id} 
            onClick={() => setSelectedReport(record)}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col cursor-pointer"
          >
            <div className="h-40 relative overflow-hidden bg-slate-100">
              <img src={record.image} alt={t(record.titleKey)} className="w-full h-full object-cover" />
              <div className="absolute top-3 end-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm bg-white/90 backdrop-blur-sm ${getStatusColor(record.status).split(' ')[1]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full me-1.5 ${getStatusColor(record.status).split(' ')[0].replace('100', '500')}`}></span>
                  {record.status === 'Healthy' ? t('history.statusHealthy') : record.status === 'High Risk' ? t('history.statusHighRisk') : t('history.statusModerate')}
                </span>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-medium text-slate-500 mb-2">
                <span className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  {getTypeIcon(record.type)}
                  <span className="ms-1">{record.type === 'Seed Intelligence' ? t('history.tabSeed') : t('history.tabDisease')}</span>
                </span>
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 me-1" />
                  {record.date}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-2">{t(record.titleKey)}</h3>
              
              <div className="mt-auto pt-4 border-t border-slate-100">
                <button 
                  onClick={(e) => handleDownload(e, record)}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors group"
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
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
          <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">{t('history.noRecords')}</h3>
          <p className="text-slate-500">{t('history.tryFilters')}</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedReport(null)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative z-10 flex flex-col max-h-full">
            <div className="h-48 sm:h-64 relative bg-slate-100 flex-shrink-0">
              <img src={selectedReport.image} alt={t(selectedReport.titleKey)} className="w-full h-full object-cover" />
              <button 
                onClick={() => setSelectedReport(null)}
                className="absolute top-4 end-4 p-2 bg-white/80 hover:bg-white text-slate-700 rounded-full shadow-sm backdrop-blur-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-slate-500">
                  <span className="flex items-center text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                    {getTypeIcon(selectedReport.type)}
                    <span className="ms-1.5">{selectedReport.type === 'Seed Intelligence' ? t('history.tabSeed') : t('history.tabDisease')}</span>
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 me-1.5" />
                    {selectedReport.date}
                  </span>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(selectedReport.status).split(' ')[1]}`}>
                  <span className={`w-2 h-2 rounded-full me-2 ${getStatusColor(selectedReport.status).split(' ')[0].replace('100', '500')}`}></span>
                  {selectedReport.status === 'Healthy' ? t('history.statusHealthy') : selectedReport.status === 'High Risk' ? t('history.statusHighRisk') : t('history.statusModerate')}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{t(selectedReport.titleKey)}</h2>
              
              <div className="prose prose-sm prose-emerald max-w-none text-slate-600 mb-8">
                <p>{t('history.reportParagraph1')} <strong>{selectedReport.status === 'Healthy' ? t('history.statusHealthy') : selectedReport.status === 'High Risk' ? t('history.statusHighRisk') : t('history.statusModerate')}</strong> {t('history.reportClassification')}</p>
                <p>{t('history.confidenceScore')} <strong>94.2%</strong></p>
                <ul>
                  <li>{t('history.reportListItem1')}</li>
                  <li>{t('history.reportListItem2')}</li>
                  <li>{t('history.reportListItem3')}</li>
                </ul>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button 
                  onClick={(e) => handleDownload(e, selectedReport)}
                  className="flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4 me-2" />
                  {t('history.downloadPdf')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
