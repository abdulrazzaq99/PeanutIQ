import { useState, useRef } from 'react';
import { 
  Upload, Camera, AlertTriangle, CheckCircle, 
  Download, RefreshCcw, Activity, Shield, Crosshair, TrendingUp, Info
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data for Progression
const progressionData = [
  { day: 'Day -7', severity: 5 },
  { day: 'Day -3', severity: 12 },
  { day: 'Today', severity: 35 },
  { day: 'Day +3', severity: 58 },
  { day: 'Day +7', severity: 82 },
];

export default function DiseaseIntelligence() {
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
          <h1 className="text-2xl font-bold text-gray-900">Disease Intelligence</h1>
          <p className="mt-1 text-sm text-gray-500">AI-powered early detection, severity assessment, and outbreak alerts.</p>
        </div>
        {status === 'complete' && (
          <div className="mt-4 sm:mt-0 flex gap-3 print:hidden">
            <button 
              onClick={handleReset}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center transition-colors cursor-pointer"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              New Analysis
            </button>
            <button 
              onClick={handleDownloadReport}
              className="px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 flex items-center transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </button>
          </div>
        )}
      </div>

      {status === 'idle' && (
        <div 
          className="mt-8 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-red-500 hover:bg-red-50 transition-all cursor-pointer bg-white"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Camera className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Crop Image</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Upload a clear photo of diseased leaves, stems, or pods. Our AI will instantly identify the issue.
          </p>
          <button className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors inline-flex items-center cursor-pointer">
            <Upload className="w-5 h-5 mr-2" />
            Select Image
          </button>
        </div>
      )}

      {status === 'analyzing' && (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm mt-8">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-red-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Crosshair className="w-10 h-10 text-red-500 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Scanning for Pathogens...</h3>
          <p className="text-gray-500">Running Deep Learning CNN models to identify diseases.</p>
          
          <div className="max-w-md mx-auto mt-8 space-y-3 text-left">
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-3" /> Image Pre-processing
            </div>
            <div className="flex items-center text-sm text-gray-900 font-medium">
              <RefreshCcw className="w-4 h-4 text-blue-500 mr-3 animate-spin" /> Assessing severity and spread...
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <div className="w-4 h-4 rounded-full border-2 border-gray-200 mr-3"></div> Generating outbreak risk levels
            </div>
          </div>
        </div>
      )}

      {status === 'complete' && (
        <div className="space-y-6">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 w-full h-1 bg-red-500 left-0"></div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Detected Disease</h3>
              <h2 className="text-2xl font-black text-red-700">Early Leaf Spot</h2>
              <div className="mt-3 flex items-center justify-center bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                <Crosshair className="w-3 h-3 mr-1" /> 94.2% AI Confidence
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Severity & Stage</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span className="w-3 h-3 rounded-full bg-gray-200"></span>
                <span className="w-3 h-3 rounded-full bg-gray-200"></span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Moderate (Stage 2)</h2>
              <p className="text-xs text-gray-500 mt-1">35% of visible foliage affected.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Outbreak Risk Level</h3>
              <div className="w-16 h-16 rounded-full border-4 border-red-500 flex items-center justify-center mb-2">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-red-600">HIGH RISK</h2>
              <p className="text-xs text-gray-500 mt-1">Accelerated by 85% humidity.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 print:grid-cols-3 gap-6">
            {/* Left Column: Image & Progression */}
            <div className="lg:col-span-1 print:col-span-1 space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Crop Analysis</h3>
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative">
                  <img src={image} alt="Crop" className="w-full h-full object-cover" />
                  {/* Fake AI detection boxes */}
                  <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 border-2 border-red-500 bg-red-500/20 rounded-md shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                  <div className="absolute bottom-1/3 right-1/4 w-1/5 h-1/5 border-2 border-red-500 bg-red-500/20 rounded-md shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-gray-400" />
                  Progression Forecast
                </h3>
                <p className="text-xs text-gray-500 mb-4">Predicted severity % without intervention</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="severity" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Column: Details & Recommendations */}
            <div className="lg:col-span-2 print:col-span-2 space-y-6">
              
              {/* Early Warning Alert */}
              <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex items-start">
                <div className="bg-red-100 p-2 rounded-full mr-4 flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-red-900">Urgent Intervention Required</h3>
                  <p className="text-sm text-red-800 mt-1">Current weather forecasts indicate prolonged high humidity (&gt;85%) over the next 5 days. Without immediate fungicidal application, severity is predicted to reach 82% (Critical Stage).</p>
                </div>
              </div>

              {/* Symptom Explanation */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                  <Info className="w-5 h-5 text-gray-400 mr-2" />
                  Pathology & Symptoms
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong>Early Leaf Spot (Cercospora arachidicola)</strong> appears as brown to reddish-brown circular spots surrounded by a yellow halo on the upper surface of the leaves. As identified by the CNN model, the lesions on your crop have reached 2-4mm in diameter, indicating an established secondary infection phase.
                </p>
              </div>

              {/* Recommendations */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                  <Shield className="w-5 h-5 text-green-600 mr-2" />
                  Management Recommendations
                </h3>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">1</div>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-bold text-gray-900">Chemical Control</h4>
                      <p className="text-sm text-gray-600 mt-1">Apply a systemic fungicide (e.g., Chlorothalonil or Tebuconazole) immediately. Ensure complete foliar coverage, especially lower leaves.</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">2</div>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-bold text-gray-900">Cultural Practices</h4>
                      <p className="text-sm text-gray-600 mt-1">Improve field drainage if possible. Avoid overhead irrigation during the late afternoon or evening to minimize leaf wetness duration.</p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">3</div>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-bold text-gray-900">Follow-up Monitoring</h4>
                      <p className="text-sm text-gray-600 mt-1">Re-evaluate the crop in 7-10 days. Upload new images to track recovery or assess the need for a secondary application.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
