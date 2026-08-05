import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, MapPin, Languages, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ProfileSetup() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signup } = useAuth();
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
    const res = await signup({ ...formData, identifier });
    setIsLoading(false);
    
    if (res.success) {
      if (res.user.role === 'admin' || res.user.role === 'researcher') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 text-center">{t('auth.profileSetup.title')}</h3>
        <p className="text-sm text-gray-500 text-center mt-1">{t('auth.profileSetup.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.profileSetup.fullName')}</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <input
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="focus:ring-green-500 focus:border-green-500 block w-full ps-10 sm:text-sm border-gray-300 rounded-md py-2 border"
              placeholder={t('auth.profileSetup.namePlaceholder')}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.profileSetup.role')}</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="block w-full ps-3 pe-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 rounded-md shadow-sm border bg-white"
          >
            <option value="farmer">{t('auth.profileSetup.roleFarmer')}</option>
            <option value="researcher">{t('auth.profileSetup.roleResearcher')}</option>
            <option value="admin">{t('auth.profileSetup.roleAdmin')}</option>
          </select>
        </div>

        {formData.role === 'farmer' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.profileSetup.farmLocation')}</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <input
                name="location"
                type="text"
                required={formData.role === 'farmer'}
                value={formData.location}
                onChange={handleChange}
                className="focus:ring-green-500 focus:border-green-500 block w-full ps-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                placeholder={t('auth.profileSetup.locationPlaceholder')}
              />
            </div>
          </div>
        )}

        {formData.role === 'farmer' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.profileSetup.languagePreference')}</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                <Languages className="h-4 w-4 text-gray-400" />
              </div>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="focus:ring-green-500 focus:border-green-500 block w-full ps-10 sm:text-sm border-gray-300 rounded-md py-2 border bg-white"
              >
                <option value="English">{t('auth.profileSetup.langEnglish')}</option>
                <option value="Urdu">{t('auth.profileSetup.langUrdu')}</option>
              </select>
            </div>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading || !formData.name.trim()}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span className="flex items-center">
                {t('auth.profileSetup.submitBtn')} <ArrowRight className="ms-2 w-4 h-4 rtl:rotate-180" />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
