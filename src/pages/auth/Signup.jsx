import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Phone, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Signup() {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [method, setMethod] = useState('phone');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    
    setIsLoading(true);
    const res = await login(identifier);
    setIsLoading(false);
    
    if (res.success) {
      navigate('/verify-otp', { state: { identifier, isLoginIntent: false } });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 text-center">{t('auth.signup.title')}</h3>
        <p className="text-sm text-gray-500 text-center mt-1">{t('auth.signup.subtitle')}</p>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
        <button
          type="button"
          onClick={() => { setMethod('phone'); setIdentifier(''); }}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
            method === 'phone' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('auth.signup.phoneTab')}
        </button>
        <button
          type="button"
          onClick={() => { setMethod('email'); setIdentifier(''); }}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
            method === 'email' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('auth.signup.emailTab')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {method === 'phone' ? t('auth.signup.phoneLabel') : t('auth.signup.emailLabel')}
          </label>
          <div className="relative rounded-md shadow-sm" dir="ltr">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {method === 'phone' ? <Phone className="h-4 w-4 text-gray-400" /> : <Mail className="h-4 w-4 text-gray-400" />}
            </div>
            <input
              name="identifier"
              type={method === 'phone' ? 'tel' : 'email'}
              required
              value={identifier}
              onChange={(e) => {
                if (method === 'phone') {
                  setIdentifier(e.target.value.replace(/[^\d\+\s\-]/g, ''));
                } else {
                  setIdentifier(e.target.value.replace(/[^a-zA-Z0-9@._\-+]/g, ''));
                }
              }}
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border text-left"
              placeholder={method === 'phone' ? t('auth.login.phonePlaceholder') : t('auth.login.emailPlaceholder')}
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !identifier.trim()}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span className="flex items-center">
                {t('auth.signup.submitBtn')} <ArrowRight className="ms-2 w-4 h-4 rtl:rotate-180" />
              </span>
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {t('auth.signup.hasAccount')}{' '}
          <Link to="/login" className="text-green-600 font-semibold hover:text-green-500">
            {t('auth.signup.loginLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
