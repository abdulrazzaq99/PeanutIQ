import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Leaf, Search, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchApi } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/date';

export default function Advisories() {
  const { t } = useTranslation();
  const [advisories, setAdvisories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAdvisories = async () => {
      const token = localStorage.getItem('peanutiq_token');
      if (!token) return;

      try {
        const res = await fetchApi('/dashboard/advisories', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setAdvisories(await res.json());
        }
      } catch (e) {
        console.error("Failed to fetch advisories", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdvisories();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('advisories.title', 'Advisories & Alerts')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('advisories.subtitle', 'Stay updated with important notifications regarding your crops and weather conditions.')}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
        </div>
      ) : advisories.length > 0 ? (
        <div className="space-y-4">
          {advisories.map((advisory) => (
            <div 
              key={advisory.id} 
              className={`bg-white border-l-4 rounded-xl shadow-sm p-5 ${
                advisory.severity === 'high' ? 'border-red-500' : 
                advisory.severity === 'medium' ? 'border-yellow-500' : 'border-blue-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {advisory.severity === 'high' ? (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Info className={`w-5 h-5 ${advisory.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'}`} />
                  )}
                  <h3 className="text-lg font-bold text-charcoal">{advisory.title}</h3>
                </div>
                <span className="text-xs font-bold text-slate-500 flex items-center whitespace-nowrap bg-slate-100 px-2 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5 me-1" />
                  {formatDate(advisory.created_at, user?.timezone)}
                </span>
              </div>
              <div className="mb-3">
                <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                  advisory.type === 'alert' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  {advisory.type.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {advisory.message}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <Leaf className="w-12 h-12 text-forest/50 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">{t('advisories.emptyTitle', 'No Active Advisories')}</h3>
          <p className="text-slate-500">{t('advisories.emptyDesc', 'There are no active alerts or advisories for your region at this time.')}</p>
        </div>
      )}
    </div>
  );
}
