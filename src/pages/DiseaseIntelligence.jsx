import { useState, useRef } from 'react';
import { 
  UploadCloud, Camera, AlertTriangle, CheckCircle, 
  Download, RefreshCcw, Activity, Shield, Crosshair, TrendingUp, Info
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

export default function DiseaseIntelligence() {
  const { t } = useTranslation();
  
  const progressionData = [
    { day: t('disease.chart.dayMinus7'), severity: 5 },
    { day: t('disease.chart.dayMinus3'), severity: 12 },
    { day: t('disease.chart.today'), severity: 35 },
    { day: t('disease.chart.dayPlus3'), severity: 58 },
    { day: t('disease.chart.dayPlus7'), severity: 82 },
  ];

  const [status, setStatus] = useState('idle'); // idle, analyzing, complete
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      simulateAnalysis();
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImage(url);
      simulateAnalysis();
    }
  };

  const simulateAnalysis = () => {
    setStatus('analyzing');
    setTimeout(() => {
      setStatus('complete');
    }, 3000);
  };

  const handleReset = () => {
    setImage(null);
    setStatus('idle');
  };

  const handleDownloadReport = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 print:mb-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">{t('disease.title')}</h1>
          <p className="mt-1 text-sm text-charcoal opacity-70">{t('disease.subtitle')}</p>
        </div>
        {status === 'complete' && (
          <div className="mt-4 sm:mt-0 flex gap-3 print:hidden">
            <button 
              onClick={handleReset}
              className="px-4 py-2 bg-sand border-2 border-earth rounded-lg text-sm font-bold text-charcoal hover:bg-forest/10 hover:text-forest hover:border-transparent flex items-center transition-colors cursor-pointer"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              {t('seed.newAnalysis')}
            </button>
            <button 
              onClick={handleDownloadReport}
              className="btn-primary px-4 py-2 text-sm flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('seed.downloadReport')}
            </button>
          </div>
        )}
      </div>

      {status === 'idle' && (
        <div 
          className="mt-8 border-2 border-dashed border-terracotta/50 rounded-2xl p-12 text-center hover:border-forest/30 hover:bg-forest/10 hover:text-forest transition-all cursor-pointer bg-white"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
          <div className="mx-auto w-20 h-20 bg-sand border border-terracotta rounded-full flex items-center justify-center mb-6">
            <i className="fa-solid fa-cloud-arrow-up text-4xl text-terracotta"></i>
          </div>
          <h3 className="text-xl font-bold text-charcoal mb-2">{t('disease.uploadTitle')}</h3>
          <p className="text-charcoal opacity-70 max-w-md mx-auto mb-6">
            {t('disease.uploadDesc')}
          </p>
          <button className="btn-primary px-6 py-2.5 inline-flex items-center cursor-pointer">
            <i className="fa-solid fa-cloud-arrow-up mr-2 text-lg"></i>
            {t('disease.selectImage')}
          </button>
        </div>
      )}

      {status === 'analyzing' && (
        <div className="flat-panel py-4 px-6 text-center mt-4 relative overflow-hidden flex flex-col items-center justify-center">
          <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden bg-forest/90 shadow-2xl h-48 sm:h-56 lg:h-64">
            {/* The uploaded image with a slight dark tint */}
            {image && <img src={image} alt="Analyzing" className="w-full h-full object-cover opacity-50 mix-blend-overlay" />}
            {!image && <div className="w-full h-full bg-[#1e3a29]"></div>}
            


            {/* Corner Brackets */}
            <div className="absolute top-6 left-6 w-12 h-12 border-t-4 border-l-4 border-white/80 rounded-tl-2xl z-10"></div>
            <div className="absolute top-6 right-6 w-12 h-12 border-t-4 border-r-4 border-white/80 rounded-tr-2xl z-10"></div>
            <div className="absolute bottom-6 left-6 w-12 h-12 border-b-4 border-l-4 border-white/80 rounded-bl-2xl z-10"></div>
            <div className="absolute bottom-6 right-6 w-12 h-12 border-b-4 border-r-4 border-white/80 rounded-br-2xl z-10"></div>

            {/* Floating particles/dots */}
            <div className="absolute top-[30%] left-[30%] w-3 h-5 rounded-full bg-white/80 animate-pulse z-10"></div>
            <div className="absolute top-[40%] left-[60%] w-3 h-5 rounded-full bg-white/60 animate-pulse z-10" style={{ animationDelay: '0.1s' }}></div>
            <div className="absolute top-[60%] left-[45%] w-3 h-5 rounded-full bg-white/90 animate-pulse z-10" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute top-[50%] left-[75%] w-3 h-5 rounded-full bg-white/70 animate-pulse z-10" style={{ animationDelay: '0.2s' }}></div>

            {/* The scanning line */}
            <div className="absolute left-0 right-0 h-0.5 bg-[#f0c169] shadow-[0_0_20px_#f0c169] z-20 animate-scan">
              <div className="absolute -top-16 left-0 right-0 h-16 bg-gradient-to-t from-[#f0c169]/30 to-transparent"></div>
              <div className="absolute top-0.5 left-0 right-0 h-16 bg-gradient-to-b from-[#f0c169]/30 to-transparent"></div>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-charcoal mt-4 mb-1">{t('disease.scanning')}</h3>
          <p className="text-charcoal opacity-70 mb-2">{t('disease.scanningDesc')}</p>
        </div>
      )}

      {status === 'complete' && (
        <div className="space-y-6">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-6">
            <div className="flat-card border border-terracotta p-6 flex flex-col items-center justify-start text-center relative overflow-hidden">
              <div className="absolute top-0 w-full h-1 bg-terracotta left-0"></div>
              <h3 className="text-sm font-bold text-terracotta uppercase tracking-wider mb-2 flex-shrink-0">{t('disease.detectedTitle')}</h3>
              <div className="h-16 flex items-center justify-center w-full mb-2 flex-shrink-0">
                <div className="flex items-center justify-center bg-red-50 border border-terracotta text-terracotta px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                  <Crosshair className="w-3.5 h-3.5 mr-1.5" /> {t('disease.confidence')}
                </div>
              </div>
              <h2 className="text-xl font-black text-terracotta">{t('disease.detectedValue')}</h2>
              <p className="text-xs text-charcoal opacity-0 mt-1 flex-1 select-none">Placeholder</p>
            </div>
            
            <div className="flat-card border border-orange-400 p-6 flex flex-col items-center justify-start text-center relative overflow-hidden">
              <div className="absolute top-0 w-full h-1 bg-orange-400 left-0"></div>
              <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-2 flex-shrink-0">{t('disease.severityTitle')}</h3>
              <div className="h-16 flex items-center justify-center w-full mb-2 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-orange-400 shadow-sm"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-orange-400 shadow-sm"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-gray-200"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-gray-200"></span>
                </div>
              </div>
              <h2 className="text-xl font-black text-orange-500">{t('disease.severityValue')}</h2>
              <p className="text-xs text-charcoal opacity-70 mt-1 flex-1">{t('disease.severityDesc')}</p>
            </div>

            <div className="flat-card border border-red-500 p-6 flex flex-col items-center justify-start text-center relative overflow-hidden">
              <div className="absolute top-0 w-full h-1 bg-red-500 left-0"></div>
              <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-2 flex-shrink-0">{t('disease.riskTitle')}</h3>
              <div className="h-16 flex items-center justify-center w-full mb-2 flex-shrink-0">
                <div className="w-14 h-14 rounded-full border border-red-500 bg-red-50 flex items-center justify-center shadow-sm">
                  <AlertTriangle className="w-7 h-7 text-red-500" />
                </div>
              </div>
              <h2 className="text-xl font-black text-red-500">{t('disease.riskValue')}</h2>
              <p className="text-xs text-charcoal opacity-70 mt-1 flex-1">{t('disease.riskDesc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-2 gap-6">
            {/* Left Column: Image & Progression */}
            <div className="lg:col-span-1 print:col-span-1 space-y-6">
              <div className="flat-card p-6">
                <h3 className="text-sm font-bold text-forest uppercase tracking-wider mb-6">{t('disease.analysisTitle')}</h3>
                <div className="h-64 rounded-xl overflow-hidden bg-sand relative border-2 border-earth">
                  <img src={image} alt="Crop" className="w-full h-full object-cover" />
                  {/* Fake AI detection boxes */}
                  <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 border-2 border-terracotta bg-terracotta/20 rounded-md"></div>
                  <div className="absolute bottom-1/3 right-1/4 w-1/5 h-1/5 border-2 border-terracotta bg-terracotta/20 rounded-md"></div>
                </div>
              </div>

              {/* Symptom Explanation */}
              <div className="flat-card p-6">
                <h3 className="text-sm font-bold text-terracotta uppercase tracking-wider mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  {t('disease.pathologyTitle')}
                </h3>
                <p className="text-sm text-charcoal leading-relaxed" dangerouslySetInnerHTML={{ __html: t('disease.pathologyDesc') }} />
              </div>
            </div>

            {/* Right Column: Details & Recommendations */}
            <div className="lg:col-span-1 print:col-span-1 space-y-6">
              
              {/* Early Warning Alert */}
              {/* Early Warning Alert */}
              <div className="bg-white border border-red-500 p-5 rounded-2xl flex items-start">
                <div className="bg-white border border-red-500 p-2 rounded-full mr-4 flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-red-500">{t('disease.urgentTitle')}</h3>
                  <p className="text-sm text-charcoal mt-1">{t('disease.urgentDesc')}</p>
                </div>
              </div>

              {/* Progression Forecast */}
              <div className="flat-card p-5">
                <h3 className="text-sm font-bold text-forest uppercase tracking-wider mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  {t('disease.forecastTitle')}
                </h3>
                <p className="text-xs text-charcoal opacity-70 mb-4">{t('disease.forecastDesc')}</p>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E4D9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4A4A4A' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4A4A4A' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: '#C05A3B', fontWeight: 'bold' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="severity" 
                        name={t('disease.chart.severity')}
                        stroke="#C05A3B" 
                        strokeWidth={3}
                        dot={{ r: 6, fill: '#C05A3B', strokeWidth: 0 }}
                        activeDot={{ r: 8, stroke: '#FAF7F2', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

          {/* Full Width Recommendations */}
          <div className="flat-card p-6 mt-6">
            <h3 className="text-sm font-bold text-forest uppercase tracking-wider mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              {t('disease.managementTitle')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col bg-sand/50 p-4 rounded-xl border border-earth/50">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-bold text-sm shadow-md">1</div>
                  <h4 className="text-sm font-bold text-charcoal ml-3">{t('disease.rec1Title')}</h4>
                </div>
                <p className="text-sm text-charcoal opacity-80 leading-relaxed">{t('disease.rec1Desc')}</p>
              </div>
              
              <div className="flex flex-col bg-sand/50 p-4 rounded-xl border border-earth/50">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-bold text-sm shadow-md">2</div>
                  <h4 className="text-sm font-bold text-charcoal ml-3">{t('disease.rec2Title')}</h4>
                </div>
                <p className="text-sm text-charcoal opacity-80 leading-relaxed">{t('disease.rec2Desc')}</p>
              </div>

              <div className="flex flex-col bg-sand/50 p-4 rounded-xl border border-earth/50">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-bold text-sm shadow-md">3</div>
                  <h4 className="text-sm font-bold text-charcoal ml-3">{t('disease.rec3Title')}</h4>
                </div>
                <p className="text-sm text-charcoal opacity-80 leading-relaxed">{t('disease.rec3Desc')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
