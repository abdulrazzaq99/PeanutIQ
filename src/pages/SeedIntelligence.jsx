import { useState, useRef } from 'react';
import { 
  UploadCloud, Camera, AlertTriangle, CheckCircle, 
  Download, RefreshCcw, Activity, FileText, Bean,
  XCircle, ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

// Mock Data
const COLORS = ['#22c55e', '#eab308', '#f97316', '#64748b', '#ef4444'];

export default function SeedIntelligence() {
  const { t } = useTranslation();
  const mockData = [
    { name: t('seed.data.healthy'), value: 75, color: '#22c55e' },
    { name: t('seed.data.underdeveloped'), value: 12, color: '#eab308' },
    { name: t('seed.data.damaged'), value: 8, color: '#f97316' },
    { name: t('seed.data.diseased'), value: 5, color: '#ef4444' }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">{t('seed.title')}</h1>
          <p className="mt-1 text-sm text-charcoal opacity-70">{t('seed.subtitle')}</p>
        </div>
        {status === 'complete' && (
          <div className="mt-4 sm:mt-0 flex gap-3 print:hidden">
            <button 
              onClick={handleReset}
              className="px-4 py-2 bg-sand border-2 border-earth rounded-lg text-sm font-bold text-charcoal hover:bg-forest/10 hover:text-forest hover:border-transparent flex items-center transition-colors"
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
          className="mt-8 border-2 border-dashed border-earth rounded-2xl p-12 text-center hover:border-forest hover:bg-forest/10 hover:text-forest hover:border-transparent transition-all cursor-pointer bg-white"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <div className="mx-auto w-20 h-20 bg-sand border border-forest rounded-full flex items-center justify-center mb-6">
            <i className="fa-solid fa-cloud-arrow-up text-4xl text-forest"></i>
          </div>
          <h3 className="text-xl font-bold text-charcoal mb-2">{t('seed.uploadTitle')}</h3>
          <p className="text-charcoal opacity-70 max-w-md mx-auto mb-6">
            {t('seed.uploadDesc')}
          </p>
          <button className="btn-primary px-6 py-2.5 inline-flex items-center">
            <i className="fa-solid fa-camera mr-2 text-lg"></i>
            {t('seed.captureBtn')}
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
          
          <h3 className="text-xl font-bold text-charcoal mt-4 mb-1">{t('seed.analyzing')}</h3>
          <p className="text-charcoal opacity-70 mb-2">{t('seed.analyzingDesc')}</p>
        </div>
      )}

      {status === 'complete' && (
        <div className="space-y-6">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-6">
            <div className="flat-card p-6 flex flex-col items-center justify-start text-center">
              <div className="w-20 h-20 rounded-full bg-sand border border-forest flex items-center justify-center mb-4">
                <span className="text-4xl font-black text-forest">A</span>
              </div>
              <h3 className="text-lg font-bold text-charcoal">{t('seed.overallGrade')}</h3>
              <p className="text-sm text-charcoal opacity-70 mt-1">{t('seed.overallDesc')}</p>
            </div>
            
            <div className="flat-card p-6 flex flex-col items-center justify-start text-center">
              <div className="w-20 h-20 flex items-center justify-center mb-4">
                <span className="text-5xl font-black text-charcoal" dir="ltr">89<span className="text-2xl text-charcoal opacity-40">%</span></span>
              </div>
              <h3 className="text-lg font-bold text-charcoal">{t('seed.germination')}</h3>
              <p className="text-sm text-charcoal opacity-70 mt-1">{t('seed.germinationDesc')}</p>
            </div>

            <div className="flat-card p-6 flex flex-col items-center justify-start text-center">
              <div className="w-20 h-20 flex items-center justify-center mb-4">
                <span className="text-5xl font-black text-charcoal">342</span>
              </div>
              <h3 className="text-lg font-bold text-charcoal">{t('seed.totalAnalyzed')}</h3>
              <p className="text-sm text-charcoal opacity-70 mt-1">{t('seed.totalDesc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-2 gap-6">
            {/* Image Preview & Uniformity */}
            <div className="lg:col-span-1 print:col-span-1 space-y-6">
              <div className="flat-card p-6">
                <h3 className="text-sm font-bold text-forest uppercase tracking-wider mb-6">{t('seed.batchImage')}</h3>
                <div className="h-64 rounded-xl overflow-hidden bg-sand relative border-2 border-earth">
                  <img src={image} alt="Seed Batch" className="w-full h-full object-cover" />
                  {/* Fake overlay to look like AI bounding boxes */}
                  <div className="absolute inset-0 bg-forest/10 border-2 border-forest/30 rounded-xl"></div>
                </div>
              </div>

              <div className="flat-card p-5">
                <h3 className="text-sm font-bold text-forest uppercase tracking-wider mb-4">{t('seed.uniformity')}</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-charcoal opacity-70">{t('seed.sizeVar')}</span>
                      <span className="font-bold text-charcoal">{t('seed.sizeVarVal')}</span>
                    </div>
                    <div className="w-full bg-sand border border-earth rounded-full h-2">
                      <div className="bg-forest h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-charcoal opacity-70">{t('seed.colorCon')}</span>
                      <span className="font-bold text-charcoal">{t('seed.colorConVal')}</span>
                    </div>
                    <div className="w-full bg-sand border border-earth rounded-full h-2">
                      <div className="bg-forest h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Classification & Actions */}
            <div className="lg:col-span-1 print:col-span-1 space-y-6">
              <div className="flat-card p-6">
                <h3 className="text-sm font-bold text-forest uppercase tracking-wider mb-6">{t('seed.breakdown')}</h3>
                <div className="flex flex-col sm:flex-row print:flex-row items-center">
                  <div className="w-full sm:w-1/2 print:w-1/2 h-64 relative flex items-center justify-center">
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                       <span className="text-[28px] font-black text-charcoal leading-none" dir="ltr">75%</span>
                       <span className="text-[12px] font-bold text-[#07571C] mt-1 uppercase tracking-wider">{t('seed.data.healthy')}</span>
                    </div>
                    <ResponsiveContainer width="100%" height="100%" className="z-10 relative">
                      <PieChart>
                        <Pie
                          data={mockData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {mockData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: '2px solid #E5E7EB', background: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          itemStyle={{ color: '#3D4035', fontWeight: 'bold' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full sm:w-1/2 print:w-1/2 mt-6 sm:mt-0 sm:pl-8 print:mt-0 print:pl-8 space-y-4">
                    {mockData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm font-bold text-charcoal opacity-70">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-charcoal" dir="ltr">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flat-card p-6">
                <h3 className="text-sm font-bold text-forest uppercase tracking-wider mb-4 flex items-center">
                  <Bean className="w-5 h-5 mr-2" />
                  {t('seed.actions')}
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start bg-green-50 border border-green-200 p-3 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-forest mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-charcoal"><strong>{t('seed.proceedTitle')}</strong> {t('seed.proceedDesc')}</p>
                  </li>
                  <li className="flex items-start bg-red-50 border border-red-500 p-3 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-charcoal"><strong>{t('seed.manualTitle')}</strong> {t('seed.manualDesc')}</p>
                  </li>
                  <li className="flex items-start bg-sand border border-gray-200 p-3 rounded-lg">
                    <FileText className="w-5 h-5 text-charcoal mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-charcoal"><strong>{t('seed.saveTitle')}</strong> {t('seed.saveDesc')}</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
