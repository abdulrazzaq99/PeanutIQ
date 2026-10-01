import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, CheckCircle2 } from 'lucide-react';
import Logo from '../../components/Logo';
import { useTranslation } from 'react-i18next';
import PasswordInput from './PasswordInput';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const location = useLocation();
  // Create Account sends the user here with the email filled in.
  const [identifier, setIdentifier] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const accountCreated = Boolean(location.state?.created);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || !identifier.trim() || !password) return;
    if (!EMAIL.test(identifier.trim())) {
      setEmailError(t('auth.app.emailInvalid', 'Please enter a valid email address'));
      return;
    }
    setIsLoading(true);
    const res = await login(identifier, password);
    setIsLoading(false);
    if (!res.success) {
      setError(res.error);
      return;
    }
    navigate(res.user.role === 'admin' || res.user.role === 'researcher' ? '/admin' : '/user', { replace: true });
  };

  return (
    <div className="w-full max-w-[360px] mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-extrabold text-[#324329] tracking-tight">{t('auth.mockup.welcome', 'Welcome Back!')}</h3>
        <p className="text-sm text-gray-500 mt-2 font-medium">{t('auth.mockup.loginDesc', 'Login to continue your journey')}</p>
      </div>

      {accountCreated && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-[#07571C]" role="status">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{t('auth.app.accountCreated', 'Account created. Please sign in.')}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <div className="relative rounded-xl shadow-sm" dir="ltr">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="identifier"
              type="email"
              required
              autoComplete="email"
              className={`focus:ring-1 block w-full pl-11 sm:text-sm border rounded-xl py-3.5 transition-colors bg-white text-left text-charcoal outline-none ${
                emailError ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-gray-200 focus:ring-[#07571C] focus:border-[#07571C]'
              }`}
              placeholder={t('auth.app.emailPlaceholder', 'Email address')}
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setEmailError('');
                setError('');
              }}
            />
          </div>
          {emailError && <p className="mt-2 text-sm text-red-500 font-bold">{emailError}</p>}
        </div>

        <div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder={t('auth.app.password', 'Password')}
            value={password}
            hasError={Boolean(error)}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
          />
          {error && <p className="mt-2 text-sm text-red-500 font-bold">{error}</p>}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !identifier.trim() || !password}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#324329] hover:bg-[#1a2315] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#324329] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                {t('auth.app.signInBtn', 'Sign In')}
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
