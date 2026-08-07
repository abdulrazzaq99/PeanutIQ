import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Building2, Phone, Globe, Key, CheckCircle, Camera, Move, Check, X, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AdminProfile() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  
  const [phone, setPhone] = useState('+92 300 1234567');
  const [language, setLanguage] = useState(i18n.language === 'ur' ? 'ur' : 'en');
  const [isSaved, setIsSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  
  const [coverUrl, setCoverUrl] = useState(null);
  const [profileUrl, setProfileUrl] = useState(null);
  const [coverPos, setCoverPos] = useState(50);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [hasUnsavedPhotoChanges, setHasUnsavedPhotoChanges] = useState(false);
  const [photoSaved, setPhotoSaved] = useState(false);
  
  const coverInputRef = useRef(null);
  const profileInputRef = useRef(null);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (language === 'ur') {
      i18n.changeLanguage('ur');
      document.documentElement.dir = 'rtl';
      localStorage.setItem('preferredLanguage', 'ur');
    } else {
      i18n.changeLanguage('en');
      document.documentElement.dir = 'ltr';
      localStorage.setItem('preferredLanguage', 'en');
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
    e.target.reset();
  };

  const handleCoverUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCoverUrl(URL.createObjectURL(e.target.files[0]));
      setHasUnsavedPhotoChanges(true);
    }
  };

  const handleProfileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileUrl(URL.createObjectURL(e.target.files[0]));
      setHasUnsavedPhotoChanges(true);
    }
  };

  const handleMouseDown = (e) => {
    if (!isAdjusting) return;
    setIsDragging(true);
    setDragStartY(e.clientY);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaY = e.clientY - dragStartY;
    const newPos = Math.max(0, Math.min(100, coverPos - deltaY * 0.2));
    setCoverPos(newPos);
    setDragStartY(e.clientY);
  };

  const handleMouseUp = () => {
    if (isDragging) setIsDragging(false);
  };

  const initials = (user?.name || 'Admin User')
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-zA-Z ]/g, '')
    .trim()
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.profile.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('admin.profile.subtitle')}</p>
      </div>

      {/* Header Section */}
      <div className="flat-card overflow-hidden relative">
        <div 
          className={`h-48 relative group ${isAdjusting ? 'cursor-move' : ''}`}
          style={coverUrl ? { backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: `center ${coverPos}%` } : {}}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {!coverUrl && <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500"></div>}
          
          {/* Persistent Camera Button for Mobile */}
          <div className="absolute top-4 right-4 md:hidden z-10">
            <button onClick={(e) => { e.stopPropagation(); coverInputRef.current?.click(); }} className="p-2.5 bg-white/90 backdrop-blur rounded-full shadow-lg text-forest cursor-pointer border border-white/50">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          
          {/* Overlay actions */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
              {isAdjusting ? (
                <>
                  <button onClick={() => setIsAdjusting(false)} className="px-3 py-1.5 bg-white/90 backdrop-blur text-sm font-medium text-gray-700 rounded-lg hover:bg-forest/10 hover:text-forest hover:border-transparent cursor-pointer">{t('admin.profile.cancel')}</button>
                  <button onClick={() => { setIsAdjusting(false); setHasUnsavedPhotoChanges(true); }} className="px-3 py-1.5 bg-forest text-sm font-medium text-white rounded-lg hover:bg-forest hover:opacity-90 cursor-pointer">{t('admin.profile.savePosition')}</button>
                </>
              ) : (
                <>
                  <button onClick={() => coverInputRef.current?.click()} className="px-3 py-1.5 bg-white/90 backdrop-blur text-sm font-medium text-gray-700 rounded-lg hover:bg-forest/10 hover:text-forest hover:border-transparent flex items-center cursor-pointer">
                    <Camera className="w-4 h-4 rtl:ml-2 ltr:mr-2" /> {t('admin.profile.changeCover')}
                  </button>
                  {coverUrl && (
                    <button onClick={() => setIsAdjusting(true)} className="px-3 py-1.5 bg-white/90 backdrop-blur text-sm font-medium text-gray-700 rounded-lg hover:bg-forest/10 hover:text-forest hover:border-transparent flex items-center cursor-pointer">
                      <Move className="w-4 h-4 rtl:ml-2 ltr:mr-2" /> {t('admin.profile.reposition')}
                    </button>
                  )}
                  {coverUrl && (
                    <button onClick={() => { setCoverUrl(null); setHasUnsavedPhotoChanges(true); }} className="px-3 py-1.5 bg-red-50 text-sm font-medium text-red-600 rounded-lg hover:bg-red-100 flex items-center cursor-pointer">
                      <Trash2 className="w-4 h-4 rtl:ml-2 ltr:mr-2" /> {t('admin.profile.remove')}
                    </button>
                  )}
                </>
              )}
              <input type="file" accept="image/*" className="hidden" ref={coverInputRef} onChange={handleCoverUpload} />
            </div>
        </div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-16 mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-emerald-100 flex items-center justify-center text-3xl font-bold text-forest shadow-md overflow-hidden relative">
                {profileUrl ? (
                  <img src={profileUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  initials || 'AU'
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 hidden md:flex">
                  <div className="cursor-pointer p-1.5 hover:bg-white/20 rounded-full" onClick={() => profileInputRef.current?.click()}>
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  {profileUrl && (
                    <div className="cursor-pointer p-1.5 hover:bg-red-500/80 rounded-full" onClick={(e) => { e.stopPropagation(); setProfileUrl(null); setHasUnsavedPhotoChanges(true); }}>
                      <Trash2 className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Persistent Camera Badge (Mobile & Desktop) */}
              <div 
                className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-100 cursor-pointer hover:bg-gray-50 z-10 md:hidden"
                onClick={() => profileInputRef.current?.click()}
              >
                <Camera className="w-4 h-4 text-forest" />
              </div>

              <input type="file" accept="image/*" className="hidden" ref={profileInputRef} onChange={handleProfileUpload} />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'Admin User'}</h2>
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {user?.email || 'admin@peanutiq.pk'}
                  </div>
                  {user?.role === 'researcher' && (
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                      NARC Islamabad (Affiliated)
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-3">
                <div className="px-4 py-2 bg-emerald-50 text-forest text-sm font-bold rounded-full border border-emerald-100 flex items-center shadow-sm">
                  <Shield className="w-4 h-4 rtl:ml-1.5 ltr:mr-1.5" />
                  <span className="capitalize whitespace-nowrap">{user?.role === 'admin' ? t('admin.profile.role') : t('admin.profile.researcherRole')}</span>
                </div>
                {(hasUnsavedPhotoChanges || isAdjusting) && (
                  <button 
                    onClick={() => { setHasUnsavedPhotoChanges(false); setIsAdjusting(false); setIsDragging(false); setPhotoSaved(true); setTimeout(() => setPhotoSaved(false), 3000); }}
                    className="px-4 py-2 bg-forest text-white text-sm font-bold rounded-lg shadow-sm flex items-center hover:bg-forest hover:opacity-90 transition-colors cursor-pointer h-full"
                  >
                    {photoSaved ? <><CheckCircle className="w-4 h-4 rtl:ml-2 ltr:mr-2" /> {t('admin.profile.photoSaved')}</> : t('admin.profile.savePhoto')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="flat-card p-8 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <User className="w-5 h-5 rtl:ml-2 ltr:mr-2 text-forest" /> {t('admin.profile.personalInfo')}
          </h3>
          <form onSubmit={handleSaveProfile} className="space-y-5 flex flex-col flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.profile.phoneNumber')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-forest focus:border-forest text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.profile.languagePref')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="block w-full px-10 py-2 border border-gray-300 rounded-lg focus:ring-forest focus:border-forest text-sm bg-white"
                >
                  <option value="en">{t('admin.profile.english')}</option>
                  <option value="ur">{t('admin.profile.urdu')}</option>
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">{t('admin.profile.languageNote', 'Note: The admin panel defaults to English. Changing this updates your global preference.')}</p>
            </div>

            <div className="pt-4 mt-auto">
              <button
                type="submit"
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-forest hover:bg-forest hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest transition-colors cursor-pointer"
              >
                {isSaved ? <><CheckCircle className="w-4 h-4 rtl:ml-2 ltr:mr-2" /> {t('admin.profile.profileSaved')}</> : t('admin.profile.saveProfile')}
              </button>
            </div>
          </form>
        </div>

        {/* Security Section */}
        <div className="flat-card p-8 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Key className="w-5 h-5 rtl:ml-2 ltr:mr-2 text-forest" /> {t('admin.profile.securitySettings')}
          </h3>
          <form onSubmit={handleUpdatePassword} className="space-y-5 flex flex-col flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.profile.currentPassword')}</label>
              <input
                type="password"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-forest focus:border-forest text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.profile.newPassword')}</label>
              <input
                type="password"
                required
                minLength="8"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-forest focus:border-forest text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.profile.confirmPassword')}</label>
              <input
                type="password"
                required
                minLength="8"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-forest focus:border-forest text-sm"
              />
            </div>

            <div className="pt-4 mt-auto">
              <button
                type="submit"
                className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-forest/10 hover:text-forest hover:border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest transition-colors cursor-pointer"
              >
                 {passwordSaved ? <><CheckCircle className="w-4 h-4 rtl:ml-2 ltr:mr-2 text-forest" /> {t('admin.profile.passwordUpdated')}</> : t('admin.profile.updatePassword')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
