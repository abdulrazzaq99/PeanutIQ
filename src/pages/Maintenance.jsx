import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../config/api';
import { useAuth } from '../context/AuthContext';

export default function Maintenance() {
  const [checking, setChecking] = useState(false);
  const [endTime, setEndTime] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const checkStatus = async () => {
    setChecking(true);
    try {
      const res = await fetchApi('/admin/system/maintenance/status');
      if (res.ok) {
        const data = await res.json();
        if (!data.active) {
          // Maintenance is over
          navigate('/user');
        } else {
          setEndTime(data.end_time);
        }
      }
    } catch (err) {
      console.error(err);
    }
    setChecking(false);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border border-earth/20 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-forest to-earth"></div>
        
        <div className="w-20 h-20 bg-sand/50 rounded-full flex items-center justify-center mx-auto mb-6 text-forest">
          <Settings className="w-10 h-10 animate-spin-slow" />
        </div>
        
        <h1 className="text-3xl font-black text-charcoal mb-4">We'll be right back!</h1>
        <p className="text-charcoal/70 text-lg mb-8 font-medium">
          PeanutIQ is currently undergoing scheduled maintenance to improve your experience. 
        </p>
        
        {endTime && (
          <div className="bg-sand/30 p-4 rounded-xl mb-8 border border-earth/10">
            <p className="text-sm text-charcoal/60 font-bold mb-1">Expected Completion</p>
            <p className="text-lg font-black text-forest">
              {new Date(endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}

        <button 
          onClick={checkStatus}
          disabled={checking}
          className="w-full bg-forest text-white py-4 rounded-xl font-bold text-lg hover:bg-forest/90 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
        >
          {checking ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Checking...
            </>
          ) : (
            'Check Status'
          )}
        </button>

        <button 
          onClick={handleLogout}
          className="w-full text-charcoal/60 hover:text-charcoal font-bold text-sm transition-colors py-2"
        >
          Sign out and return to login
        </button>
      </div>
    </div>
  );
}
