import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** A password field with a show/hide eye, styled like the other auth inputs. */
export default function PasswordInput({ id, value, onChange, placeholder, autoComplete, hasError }) {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();
  return (
    <div className="relative rounded-xl shadow-sm" dir="ltr">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Lock className="h-5 w-5 text-gray-400" />
      </div>
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        required
        autoComplete={autoComplete}
        className={`focus:ring-1 block w-full pl-11 pr-11 sm:text-sm border rounded-xl py-3.5 transition-colors bg-white text-left text-charcoal outline-none ${
          hasError
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
            : 'border-gray-200 focus:ring-[#07571C] focus:border-[#07571C]'
        }`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t('auth.app.hidePassword', 'Hide password') : t('auth.app.showPassword', 'Show password')}
        title={visible ? t('auth.app.hidePassword', 'Hide password') : t('auth.app.showPassword', 'Show password')}
        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
      >
        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}
