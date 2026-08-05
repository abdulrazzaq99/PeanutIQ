import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef([]);
  const { t } = useTranslation();
  
  const identifier = location.state?.identifier || '';
  const isLoginIntent = location.state?.isLoginIntent ?? true;

  useEffect(() => {
    if (!identifier) {
      navigate('/login');
    }
    inputs.current[0]?.focus();
  }, [identifier, navigate]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setError('');

    // Move to next input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError(t('auth.otp.errorLength'));
      return;
    }
    
    setIsLoading(true);
    const res = await verifyOtp(identifier, otpValue, isLoginIntent);
    
    if (res.success) {
      setIsLoading(false);
      if (!isLoginIntent || res.isNewUser) {
        // They came from the Signup page OR they are logging in but don't exist
        navigate('/profile-setup', { state: { identifier } });
      } else {
        // Based on role, redirect
        if (res.user.role === 'admin' || res.user.role === 'researcher') {
          navigate('/admin');
        } else {
          navigate('/user');
        }
      }
    } else {
      setIsLoading(false);
      setError(res.error || t('auth.otp.errorInvalid'));
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-green-50 rounded-full text-green-600">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900">{t('auth.otp.title')}</h3>
        <p className="text-sm text-gray-500 mt-2">
          {t('auth.otp.subtitle')} <span className="font-semibold text-gray-800 dir-ltr inline-block">{identifier}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex justify-center gap-2 sm:gap-4" dir="ltr">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => inputs.current[idx] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="w-10 h-12 sm:w-12 sm:h-14 border border-gray-300 rounded-lg text-center text-xl font-semibold text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            ))}
          </div>
          {error && <p className="mt-3 text-sm text-red-600 text-center font-medium">{error}</p>}
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span className="flex items-center">
                {t('auth.otp.submitBtn')} <ArrowRight className="ms-2 w-4 h-4 rtl:rotate-180" />
              </span>
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          {t('auth.otp.notReceived')}{' '}
          <button className="text-green-600 font-medium hover:text-green-500">{t('auth.otp.resendBtn')}</button>
        </p>
        <div className="mt-4">
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            {t('auth.otp.changeContact')}
          </Link>
        </div>
      </div>
    </div>
  );
}
