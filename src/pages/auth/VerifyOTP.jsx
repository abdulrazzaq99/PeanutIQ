import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock } from 'lucide-react';
import Logo from '../../components/Logo';
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
        navigate('/profile-setup', { state: { identifier } });
      } else {
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
    <div className="w-full max-w-[360px] mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-extrabold text-[#324329] tracking-tight">{t('auth.otp.title', 'Verification Code')}</h3>
        <p className="text-sm text-gray-500 mt-2 font-medium">
          {t('auth.otp.subtitle', 'We sent a code to')} <span className="font-bold text-charcoal dir-ltr inline-block">{identifier}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex justify-between gap-2 sm:gap-3" dir="ltr">
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
                className="w-[45px] h-[52px] sm:w-[50px] sm:h-[56px] border border-gray-200 rounded-xl text-center text-xl font-bold text-charcoal bg-white focus:ring-1 focus:ring-[#07571C] focus:border-[#07571C] transition-colors outline-none"
              />
            ))}
          </div>
          {error && <p className="mt-3 text-[13px] text-red-500 text-center font-bold">{error}</p>}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#324329] hover:bg-[#1a2315] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#324329] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                {t('auth.otp.submitBtn', 'Verify Code')}
                <Logo className="ml-2 w-4 h-4 opacity-80" sparkleColor="currentColor" />
              </>
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-center space-y-4">
        <p className="text-[13px] text-gray-500 font-medium">
          {t('auth.otp.notReceived', "Didn't receive it?")}{' '}
          <button className="text-[#07571C] font-bold hover:text-[#324329] transition-colors">{t('auth.otp.resendBtn', 'Resend OTP')}</button>
        </p>
        <div>
          <Link to="/login" className="text-[13px] font-bold text-gray-400 hover:text-[#324329] transition-colors">
            {t('auth.otp.changeContact', 'Change phone number or email')}
          </Link>
        </div>
      </div>
    </div>
  );
}
