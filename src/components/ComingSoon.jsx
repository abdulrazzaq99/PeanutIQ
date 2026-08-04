import { Sparkles } from 'lucide-react';

export default function ComingSoon({ title, description, icon: Icon, features }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] bg-gradient-to-b from-gray-50 to-white px-4 text-center">
      <div className="relative mb-8 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white p-6 rounded-full border border-gray-100 shadow-sm flex items-center justify-center">
          <Icon className="w-16 h-16 text-green-600" />
        </div>
      </div>
      
      <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 shadow-sm border border-green-100">
        <Sparkles className="w-4 h-4 text-green-500" />
        <span>Coming Soon</span>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
        {title}
      </h1>
      
      <p className="max-w-2xl text-lg text-gray-500 mb-10 leading-relaxed">
        {description}
      </p>
      
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        {features.map((feature, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-emerald-500/20 transition-shadow duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4 text-green-600 group-hover:bg-green-100 transition-colors">
              <feature.icon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-500">{feature.description}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-sm text-gray-400">
        Agentic AI Powered Seed-to-Harvest Ecosystem
      </div>
    </div>
  );
}
