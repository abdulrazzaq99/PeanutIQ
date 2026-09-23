import { useState } from 'react';
import { User, Mail, Phone, MapPin, Edit3, Target, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FARM_REGIONS } from '../utils/constants';

export default function Users() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showTimezoneMenu, setShowTimezoneMenu] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    location: user?.farm_location || user?.location || '',
    language: user?.language_preference || user?.language || 'English',
    timezone: user?.timezone || 'UTC',
    cropType: user?.cropType || 'Peanut',
    email: user?.email || user?.identifier || ''
  });



  const handleSave = async () => {
    try {
      const res = await updateProfile({
        name: formData.name,
        farm_location: formData.location,
        language_preference: formData.language.toLowerCase(),
        timezone: formData.timezone
      });
      if (res.success) {
        setIsEditing(false);
      } else {
        console.error("Update failed:", res.error);
        alert("Failed to update profile: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('profile.subtitle')}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          {isEditing ? (
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-forest border border-transparent rounded-lg text-sm font-medium text-white hover:bg-forest hover:opacity-90 flex items-center cursor-pointer transition-colors"
            >
              {t('profile.saveChanges')}
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-forest/10 hover:text-forest hover:border-transparent flex items-center cursor-pointer transition-colors"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {t('profile.editProfile')}
            </button>
          )}

        </div>
      </div>

      <div className="flat-card">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 space-x-0 sm:gap-">
            <div className="flex-shrink-0">
              <img 
                className="h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover border-4 border-white shadow-lg" 
                src={`https://ui-avatars.com/api/?name=${user?.name ? user.name.replace(' ', '+') : 'User'}&background=2D5A27&color=fff&size=128`} 
                alt="Profile" 
              />
            </div>
            <div className="flex-1 text-start w-full">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="text-2xl font-bold text-gray-900 border-b border-gray-300 focus:border-forest focus:outline-none bg-transparent w-full max-w-xs"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              )}
              <p className="text-sm text-gray-500 font-medium mt-1 capitalize">{t(`profile.roles.${user.role}`, user.role)}</p>
              
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-start text-sm text-gray-600">
                  <Mail className="w-5 h-5 me-3 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="border-b border-gray-300 focus:border-forest focus:outline-none bg-transparent w-full"
                      placeholder={t('profile.placeholder.phoneOrEmail')}
                    />
                  ) : (
                    <>{user.email || user.identifier || t('profile.noContact')}</>
                  )}
                </div>
                
                {user.role === 'farmer' && (
                  <div className="flex items-center justify-start text-sm text-gray-600">
                    <MapPin className="w-5 h-5 me-3 text-gray-400" />
                    {isEditing ? (
                      <select
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="border-b border-gray-300 focus:border-forest focus:outline-none bg-transparent w-full text-sm appearance-none"
                      >
                        <option value="" disabled>{t('profile.placeholder.location')}</option>
                        {FARM_REGIONS.map(region => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    ) : (
                      <>{user.farm_location || user.location || t('profile.unknownLocation')}</>
                    )}
                  </div>
                )}
                
                {user.role === 'farmer' && (
                  <div className="flex items-center justify-start text-sm text-gray-600">
                    <Target className="w-5 h-5 me-3 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.cropType}
                        onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                        className="border-b border-gray-300 focus:border-forest focus:outline-none bg-transparent w-full"
                        placeholder={t('profile.placeholder.cropType')}
                      />
                    ) : (
                      <>{user.cropType || 'Peanut'}</>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-start text-sm text-gray-600">
                  <User className="w-5 h-5 me-3 text-gray-400" />
                  ID: {user.id}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-sand px-6 sm:px-8 py-6 border-t border-slate-200 rounded-b-2xl">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">{t('profile.accountPreferences')}</h3>
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-2 sm:gap-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{t('profile.languagePreference')}</p>
                <p className="text-xs text-gray-500">{t('profile.languageDescription')}</p>
              </div>
              <div className="relative mt-2 sm:mt-0">
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className={`flex items-center justify-between w-full sm:w-32 px-3 py-2 text-sm border-slate-200 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest rounded-xl shadow-sm border cursor-pointer transition-colors ${!isEditing ? 'bg-sand opacity-75 cursor-not-allowed' : 'bg-white hover:bg-forest/10 hover:text-forest hover:border-transparent'}`}
                >
                  <span className="font-medium capitalize">{isEditing ? formData.language : (user.language_preference || user.language)}</span>
                  <ChevronDown className="h-4 w-4 text-slate-500 ms-2" />
                </button>

                {showLangMenu && isEditing && (
                  <div className="absolute top-full mt-2 w-full rounded-xl shadow-lg py-1 bg-white border border-slate-200 overflow-hidden z-50">
                    <button
                      type="button"
                      onClick={() => { setFormData({...formData, language: 'English'}); setShowLangMenu(false); }}
                      className="w-full text-start px-4 py-2 text-sm font-bold text-charcoal hover:bg-forest/10 hover:text-forest flex items-center cursor-pointer"
                    >
                      {t('profile.english')}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFormData({...formData, language: 'Urdu'}); setShowLangMenu(false); }}
                      className="w-full text-start px-4 py-2 text-sm font-bold text-charcoal hover:bg-forest/10 hover:text-forest flex items-center cursor-pointer"
                    >
                      {t('profile.urdu')}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-slate-200 my-4"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-2 sm:gap-0">
              <div>
                <p className="text-sm font-medium text-gray-900">Time Zone</p>
                <p className="text-xs text-gray-500">Sets how dates and times are displayed to you on your dashboard.</p>
              </div>
              <div className="relative mt-2 sm:mt-0">
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() => setShowTimezoneMenu(!showTimezoneMenu)}
                  className={`flex items-center justify-between w-full sm:w-48 px-3 py-2 text-sm border-slate-200 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest rounded-xl shadow-sm border cursor-pointer transition-colors ${!isEditing ? 'bg-sand opacity-75 cursor-not-allowed' : 'bg-white hover:bg-forest/10 hover:text-forest hover:border-transparent'}`}
                >
                  <span className="font-medium truncate mr-2">{isEditing ? formData.timezone : (user.timezone || 'UTC')}</span>
                  <ChevronDown className="h-4 w-4 text-slate-500 flex-shrink-0" />
                </button>

                {showTimezoneMenu && isEditing && (
                  <div className="absolute top-full mt-2 w-full rounded-xl shadow-lg py-1 bg-white border border-slate-200 overflow-hidden z-50">
                    <button
                      type="button"
                      onClick={() => { setFormData({...formData, timezone: 'UTC'}); setShowTimezoneMenu(false); }}
                      className="w-full text-start px-4 py-2 text-sm font-bold text-charcoal hover:bg-forest/10 hover:text-forest flex items-center cursor-pointer"
                    >
                      UTC (Default)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFormData({...formData, timezone: 'Asia/Karachi'}); setShowTimezoneMenu(false); }}
                      className="w-full text-start px-4 py-2 text-sm font-bold text-charcoal hover:bg-forest/10 hover:text-forest flex items-center cursor-pointer"
                    >
                      Pakistan (PKT)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFormData({...formData, timezone: 'Asia/Riyadh'}); setShowTimezoneMenu(false); }}
                      className="w-full text-start px-4 py-2 text-sm font-bold text-charcoal hover:bg-forest/10 hover:text-forest flex items-center cursor-pointer"
                    >
                      Arabia (AST)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFormData({...formData, timezone: 'Europe/London'}); setShowTimezoneMenu(false); }}
                      className="w-full text-start px-4 py-2 text-sm font-bold text-charcoal hover:bg-forest/10 hover:text-forest flex items-center cursor-pointer"
                    >
                      Greenwich (GMT)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFormData({...formData, timezone: 'America/New_York'}); setShowTimezoneMenu(false); }}
                      className="w-full text-start px-4 py-2 text-sm font-bold text-charcoal hover:bg-forest/10 hover:text-forest flex items-center cursor-pointer"
                    >
                      Eastern (EST)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
