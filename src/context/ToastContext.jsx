import { createContext, useContext, useState, useCallback } from 'react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ show: false, message: '', subtext: '', type: 'success' });

  const showToast = useCallback((message, subtext = '', type = 'success') => {
    setToast({ show: true, message, subtext, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={`fixed bottom-10 right-4 md:right-10 rtl:right-auto rtl:left-4 rtl:md:left-10 transition-all duration-500 z-[100] ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className={`bg-white border-l-4 rtl:border-l-0 rtl:border-r-4 rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] p-4 flex items-start max-w-sm ${toast.type === 'error' ? 'border-red-500' : toast.type === 'warning' ? 'border-amber-500' : toast.type === 'info' ? 'border-blue-500' : 'border-forest'}`}>
          <div className={`rounded-full p-1.5 mr-3 rtl:mr-0 rtl:ml-3 flex-shrink-0 ${toast.type === 'error' ? 'bg-red-100' : toast.type === 'warning' ? 'bg-amber-100' : toast.type === 'info' ? 'bg-blue-100' : 'bg-emerald-100'}`}>
            {toast.type === 'error' || toast.type === 'warning' ? (
              <AlertTriangle className={`w-5 h-5 ${toast.type === 'error' ? 'text-red-600' : 'text-amber-600'}`} />
            ) : toast.type === 'info' ? (
              <Info className="w-5 h-5 text-blue-600" />
            ) : (
              <Check className="w-5 h-5 text-forest" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">{toast.message}</h4>
            {toast.subtext && <p className="text-xs text-gray-500 mt-1">{toast.subtext}</p>}
          </div>
          <button onClick={hideToast} className="ml-4 rtl:ml-0 rtl:mr-4 text-gray-400 hover:text-gray-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
