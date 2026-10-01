import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, MapPin, Languages } from 'lucide-react';
import Logo from '../../components/Logo';
import { useTranslation } from 'react-i18next';
import { FARM_REGIONS } from '../../utils/constants';
import PasswordInput from './PasswordInput';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME = /^[\p{L}\p{M}\s]*$/u; // letters (any script) and spaces, like the old profile setup
const MIN_PASSWORD = 8;

const inputClass = (hasError) =>
  `focus:ring-1 block w-full ps-11 sm:text-sm border rounded-xl py-2.5 transition-colors bg-white text-left text-charcoal outline-none ${
    hasError ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-gray-200 focus:ring-[#07571C] focus:border-[#07571C]'
  }`;

const Chevron = () => (
  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
  </div>
);

/** Create Account. On success the user goes to Login (not the dashboard) with the email filled in. */
export default function Signup() {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    location: '',
    language: i18n.language === 'ur' ? 'urdu' : 'english',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => {
    const value = e.target.value;
    if (field === 'name' && !NAME.test(value)) return;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors({});
    setError('');
  };

  const complete = form.name.trim() && form.email.trim() && form.password && form.confirm && form.location;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || !complete) return;
    const found = {};
    if (!EMAIL.test(form.email.trim())) found.email = t('auth.app.emailInvalid', 'Please enter a valid email address');
    if (form.password.length < MIN_PASSWORD) found.password = t('auth.app.passwordShort', 'Password must be at least 8 characters');
    if (form.confirm !== form.password) found.confirm = t('auth.app.passwordMismatch', 'Passwords do not match');
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    setIsLoading(true);
    const res = await register({
      name: form.name,
      identifier: form.email,
      password: form.password,
      farm_location: form.location,
      language_preference: form.language,
    });
    setIsLoading(false);
    if (!res.success) {
      setError(res.error);
      return;
    }
    navigate('/login', { replace: true, state: { email: form.email.trim(), created: true } });
  };

  const label = (key, fallback) => <label className="block text-xs font-bold text-gray-600 mb-1">{t(key, fallback)}</label>;
  const fieldError = (field) => errors[field] && <p className="mt-1.5 text-sm text-red-500 font-bold">{errors[field]}</p>;

  return (
    <div className="w-full max-w-[360px] mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-extrabold text-[#324329] tracking-tight">{t('auth.signup.title', 'Create an Account')}</h3>
        <p className="text-sm text-gray-500 mt-2 font-medium">{t('auth.signup.subtitle', 'Join PeanutIQ today.')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div>
          {label('auth.profileSetup.fullName', 'Full Name')}
          <div className="relative rounded-xl shadow-sm" dir="ltr">
            <div className="absolute inset-y-0 left-0 ps-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input id="name" type="text" required autoComplete="name" value={form.name} onChange={set('name')}
              className={inputClass(false)} placeholder={t('auth.profileSetup.namePlaceholder', 'e.g. Ahmad Khan')} />
          </div>
        </div>

        <div>
          {label('auth.signup.emailLabel', 'Email Address')}
          <div className="relative rounded-xl shadow-sm" dir="ltr">
            <div className="absolute inset-y-0 left-0 ps-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input id="email" type="email" required autoComplete="email" value={form.email} onChange={set('email')}
              className={inputClass(errors.email)} placeholder={t('auth.app.emailPlaceholder', 'Email address')} />
          </div>
          {fieldError('email')}
        </div>

        <div>
          {label('auth.app.password', 'Password')}
          <PasswordInput id="password" autoComplete="new-password" value={form.password} onChange={set('password')}
            hasError={Boolean(errors.password)} placeholder={t('auth.app.passwordHint', 'At least 8 characters')} />
          {fieldError('password')}
        </div>

        <div>
          {label('auth.app.confirmPassword', 'Confirm Password')}
          <PasswordInput id="confirm" autoComplete="new-password" value={form.confirm} onChange={set('confirm')}
            hasError={Boolean(errors.confirm)} placeholder={t('auth.app.confirmPassword', 'Confirm Password')} />
          {fieldError('confirm')}
        </div>

        <div>
          {label('auth.profileSetup.farmLocation', 'Farm Location')}
          <div className="relative rounded-xl shadow-sm" dir="ltr">
            <div className="absolute inset-y-0 left-0 ps-4 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <select id="location" required value={form.location} onChange={set('location')}
              className={`${inputClass(false)} pe-10 appearance-none ${form.location ? '' : 'text-gray-400'}`}>
              <option value="" disabled>{t('auth.profileSetup.locationPlaceholder', 'e.g. Attock, Punjab')}</option>
              {FARM_REGIONS.map((region) => (
                <option key={region} value={region} className="text-charcoal">{region}</option>
              ))}
            </select>
            <Chevron />
          </div>
        </div>

        <div>
          {label('auth.profileSetup.languagePreference', 'Language Preference')}
          <div className="relative rounded-xl shadow-sm" dir="ltr">
            <div className="absolute inset-y-0 left-0 ps-4 flex items-center pointer-events-none">
              <Languages className="h-5 w-5 text-gray-400" />
            </div>
            <select id="language" value={form.language} onChange={set('language')} className={`${inputClass(false)} pe-10 appearance-none`}>
              <option value="english">{t('auth.profileSetup.langEnglish', 'English')}</option>
              <option value="urdu">{t('auth.profileSetup.langUrdu', 'Urdu')}</option>
            </select>
            <Chevron />
          </div>
        </div>

        {error && <p className="text-sm text-red-500 font-bold text-center">{error}</p>}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !complete}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#324329] hover:bg-[#1a2315] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#324329] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                {t('auth.profileSetup.submitBtn', 'Create Account')}
                <Logo className="ml-2 w-4 h-4 opacity-80" sparkleColor="currentColor" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-[13px] text-gray-500 font-medium">
          {t('auth.signup.hasAccount', 'Already have an account?')}{' '}
          <Link to="/login" className="font-bold text-[#07571C] hover:text-[#324329] transition-colors">
            {t('auth.signup.loginLink', 'Sign in')}
          </Link>
        </p>
      </div>
    </div>
  );
}
