import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Phone, ArrowRight } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [method, setMethod] = useState('phone'); // 'phone' or 'email'
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    
    setIsLoading(true);
    const res = await login(identifier);
    setIsLoading(false);
    
    if (res.success) {
      navigate('/verify-otp', { state: { identifier, isLoginIntent: true } });
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-900 text-center tracking-tight">Welcome Back</h3>
        <p className="text-sm text-slate-500 text-center mt-2">Sign in to your account</p>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
        <button
          onClick={() => { setMethod('phone'); setIdentifier(''); }}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
            method === 'phone' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Phone Number
        </button>
        <button
          onClick={() => { setMethod('email'); setIdentifier(''); }}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
            method === 'email' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Email Address
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="identifier" className="block text-sm font-semibold text-slate-700">
            {method === 'phone' ? 'Phone Number' : 'Email Address'}
          </label>
          <div className="mt-2 relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {method === 'phone' ? (
                <Phone className="h-5 w-5 text-slate-400" />
              ) : (
                <Mail className="h-5 w-5 text-slate-400" />
              )}
            </div>
            <input
              id="identifier"
              type={method === 'phone' ? 'tel' : 'email'}
              required
              className="focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-11 sm:text-sm border-slate-200 rounded-xl py-3 transition-colors bg-white/50"
              placeholder={method === 'phone' ? '+92 300 0000000' : 'you@example.com'}
              value={identifier}
              onChange={(e) => {
                if (method === 'phone') {
                  // Allow only numbers, plus sign, space, and dash
                  setIdentifier(e.target.value.replace(/[^\d\+\s\-]/g, ''));
                } else {
                  // For email, allow only valid email characters
                  setIdentifier(e.target.value.replace(/[^a-zA-Z0-9@._\-+]/g, ''));
                }
              }}
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !identifier.trim()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span className="flex items-center">
                Continue Securely <ArrowRight className="ml-2 w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-8 text-center space-y-4">
        <p className="text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-emerald-600 font-bold hover:text-emerald-500 transition-colors">
            Sign up
          </Link>
        </p>
        <p className="text-xs text-slate-400 bg-slate-50 inline-block px-3 py-1.5 rounded-lg border border-slate-100">
          Admin login: <span className="font-bold text-slate-600">admin@peanutiq.pk</span> (OTP: 123456)
        </p>
      </div>
    </div>
  );
}
