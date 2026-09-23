import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Eye } from 'lucide-react';
import Logo from '../../components/Logo';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    
    setIsLoading(true);
    const res = await login(identifier);
    setIsLoading(false);
    
    if (res.success) {
      navigate('/verify-otp', { state: { identifier, isLoginIntent: true } });
    } else {
      setError(res.error || "Something went wrong.");
    }
  };

  return (
    <div className="w-full max-w-[360px] mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-extrabold text-[#324329] tracking-tight">{t('auth.mockup.welcome', 'Welcome Back!')}</h3>
        <p className="text-sm text-gray-500 mt-2 font-medium">{t('auth.mockup.loginDesc', 'Login to continue your journey')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email or Phone Number Input */}
        <div>
          <div className="relative rounded-xl shadow-sm" dir="ltr">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="identifier"
              type="text"
              required
              className="focus:ring-1 focus:ring-[#07571C] focus:border-[#07571C] block w-full pl-11 sm:text-sm border border-gray-200 rounded-xl py-3.5 transition-colors bg-white text-left text-charcoal outline-none"
              placeholder={t('auth.mockup.identifierPlaceholder', 'Email or Phone Number')}
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError('');
              }}
            />
          </div>
          {error && <p className="mt-2 text-sm text-red-500 font-bold">{error}</p>}
        </div>



        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !identifier.trim()}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#324329] hover:bg-[#1a2315] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#324329] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                {t('auth.login.sendOtp', 'Send OTP')}
                <Logo className="ml-2 w-4 h-4 opacity-80" sparkleColor="currentColor" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-[13px] text-gray-500 font-medium">
          {t('auth.login.noAccount', "Don't have an account?")}{' '}
          <Link to="/signup" className="font-bold text-[#07571C] hover:text-[#324329] transition-colors">
            {t('auth.login.signupLink', 'Sign up')}
          </Link>
        </p>
      </div>
      

    </div>
  );
}
