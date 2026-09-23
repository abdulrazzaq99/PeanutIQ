import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, MapPin, Languages } from 'lucide-react';
import Logo from '../../components/Logo';
import { useTranslation } from 'react-i18next';
import { FARM_REGIONS } from '../../utils/constants';

export default function ProfileSetup() {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  
  const identifier = location.state?.identifier || '';

  useEffect(() => {
    if (!identifier) {
      navigate('/signup');
    }
  }, [identifier, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    role: 'farmer',
    location: '',
    cropType: 'Peanut',
    language: 'English'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'name') {
      // Allow only letters (including Urdu/Arabic characters) and spaces
      const regex = /^[\p{L}\p{M}\s]*$/u;
      if (!regex.test(value)) {
        return; // Ignore invalid input
      }
    }
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Force Admin and Researcher to English
      if (name === 'role' && value !== 'farmer') {
        updated.language = 'English';
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await updateProfile({
      name: formData.name,
      farm_location: formData.location,
      language_preference: formData.language.toLowerCase()
    });
    setIsLoading(false);
    
    if (res.success) {
      navigate('/user');
    } else {
      alert("Failed to update profile");
    }
  };

  return (
    <div className="w-full max-w-[360px] mx-auto">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-extrabold text-[#324329] tracking-tight">{t('auth.profileSetup.title')}</h3>
        <p className="text-sm text-gray-500 mt-2 font-medium">{t('auth.profileSetup.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">{t('auth.profileSetup.fullName')}</label>
          <div className="relative rounded-xl shadow-sm" dir="ltr">
            <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 ps-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="focus:ring-1 focus:ring-[#07571C] focus:border-[#07571C] block w-full ps-11 sm:text-sm border border-gray-200 rounded-xl py-2.5 transition-colors bg-white text-left text-charcoal outline-none"
              placeholder={t('auth.profileSetup.namePlaceholder')}
            />
          </div>
        </div>



        {formData.role === 'farmer' && (
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">{t('auth.profileSetup.farmLocation')}</label>
            <div className="relative rounded-xl shadow-sm" dir="ltr">
              <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 ps-4 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <select
                name="location"
                required={formData.role === 'farmer'}
                value={formData.location}
                onChange={handleChange}
                className="focus:ring-1 focus:ring-[#07571C] focus:border-[#07571C] block w-full ps-11 sm:text-sm border border-gray-200 rounded-xl py-2.5 transition-colors bg-white text-left text-charcoal outline-none appearance-none"
              >
                <option value="" disabled>{t('auth.profileSetup.locationPlaceholder')}</option>
                {FARM_REGIONS.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {formData.role === 'farmer' && (
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">{t('auth.profileSetup.languagePreference')}</label>
            <div className="relative rounded-xl shadow-sm" dir="ltr">
              <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 ps-4 flex items-center pointer-events-none">
                <Languages className="h-5 w-5 text-gray-400" />
              </div>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="focus:ring-1 focus:ring-[#07571C] focus:border-[#07571C] block w-full ps-11 pe-10 sm:text-sm border border-gray-200 rounded-xl py-2.5 transition-colors bg-white text-left text-charcoal outline-none appearance-none"
              >
                <option value="English">{t('auth.profileSetup.langEnglish')}</option>
                <option value="Urdu">{t('auth.profileSetup.langUrdu')}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center px-4">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !formData.name.trim()}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#324329] hover:bg-[#1a2315] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#324329] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                {t('auth.profileSetup.submitBtn')} 
                <Logo className="ml-2 w-4 h-4 opacity-80" sparkleColor="currentColor" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
