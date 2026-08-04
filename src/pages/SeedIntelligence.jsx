import { useState, useRef } from 'react';
import { 
  Upload, Camera, AlertTriangle, CheckCircle, 
  Download, RefreshCcw, Activity, FileText, Sprout,
  XCircle, ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock Data
const COLORS = ['#22c55e', '#eab308', '#f97316', '#64748b', '#ef4444'];
const mockData = [
  { name: 'Healthy', value: 75, color: '#22c55e' },
  { name: 'Underdeveloped', value: 12, color: '#eab308' },
  { name: 'Damaged', value: 8, color: '#f97316' },
  { name: 'Diseased', value: 5, color: '#ef4444' }
];

export default function SeedIntelligence() {
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
          <h1 className="text-2xl font-bold text-gray-900">Seed Intelligence</h1>
          <p className="mt-1 text-sm text-gray-500">AI-powered seed batch analysis and quality grading.</p>
        </div>
        {status === 'complete' && (
          <div className="mt-4 sm:mt-0 flex gap-3 print:hidden">
            <button 
              onClick={handleReset}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              New Analysis
            </button>
            <button 
              onClick={handleDownloadReport}
              className="px-4 py-2 bg-green-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-green-700 flex items-center transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </button>
          </div>
        )}
      </div>

      {status === 'idle' && (
        <div 
          className="mt-8 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer bg-white"
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
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Upload className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Seed Batch Image</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Drag and drop a clear image of your seed batch here, or click to browse. On mobile, you can use your camera directly.
          </p>
          <button className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors inline-flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            Capture / Select Image
          </button>
        </div>
      )}

      {status === 'analyzing' && (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm mt-8">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-10 h-10 text-green-500 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Seeds...</h3>
          <p className="text-gray-500">Our AI model is segmenting and evaluating each seed.</p>
          
          <div className="max-w-md mx-auto mt-8 space-y-3 text-left">
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-3" /> OpenCV Segmentation complete
            </div>
            <div className="flex items-center text-sm text-gray-900 font-medium">
              <RefreshCcw className="w-4 h-4 text-blue-500 mr-3 animate-spin" /> CNN Classification in progress...
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <div className="w-4 h-4 rounded-full border-2 border-gray-200 mr-3"></div> Generating Health Score
            </div>
          </div>
        </div>
      )}

      {status === 'complete' && (
        <div className="space-y-6">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <span className="text-4xl font-black text-green-600">A</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Overall Quality Grade</h3>
              <p className="text-sm text-gray-500 mt-1">Excellent batch for planting.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 flex items-center justify-center mb-4">
                <span className="text-5xl font-black text-gray-900">89<span className="text-2xl text-gray-400">%</span></span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Germination Potential</h3>
              <p className="text-sm text-gray-500 mt-1">Estimated viability based on visual health.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 flex items-center justify-center mb-4">
                <span className="text-5xl font-black text-gray-900">342</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Total Seeds Analyzed</h3>
              <p className="text-sm text-gray-500 mt-1">Successfully segmented from batch.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 print:grid-cols-3 gap-6">
            {/* Image Preview & Uniformity */}
            <div className="lg:col-span-1 print:col-span-1 space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Batch Image</h3>
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative">
                  <img src={image} alt="Seed Batch" className="w-full h-full object-cover" />
                  {/* Fake overlay to look like AI bounding boxes */}
                  <div className="absolute inset-0 bg-green-500/10 border-2 border-green-500/30 rounded-xl"></div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Uniformity Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Size Variance</span>
                      <span className="font-medium text-gray-900">Low (4.2%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Color Consistency</span>
                      <span className="font-medium text-gray-900">High (92%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Classification & Actions */}
            <div className="lg:col-span-2 print:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Seed Classification Breakdown</h3>
                <div className="flex flex-col sm:flex-row print:flex-row items-center">
                  <div className="w-full sm:w-1/2 print:w-1/2 h-64">
                    <ResponsiveContainer width="100%" height="100%">
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
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full sm:w-1/2 print:w-1/2 mt-6 sm:mt-0 sm:pl-8 print:mt-0 print:pl-8 space-y-4">
                    {mockData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                  <Sprout className="w-5 h-5 text-green-600 mr-2" />
                  Recommended Actions
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start bg-green-50 p-3 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-900"><strong>Proceed with Planting:</strong> The batch has a high germination potential. Ensure optimal soil moisture before sowing.</p>
                  </li>
                  <li className="flex items-start bg-orange-50 p-3 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-orange-900"><strong>Manual Sorting Recommended:</strong> Remove approximately 8% damaged seeds to improve overall yield uniformity.</p>
                  </li>
                  <li className="flex items-start bg-blue-50 p-3 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-900"><strong>Save Report:</strong> Download this quality report for future benchmarking and traceability.</p>
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
