import { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';
import { fetchApi } from '../config/api';

const setGlobalLanguage = (userLangStr, isExplicitUpdate = false) => {
  const localPref = localStorage.getItem('preferredLanguage');
  const dbCode = userLangStr === 'Urdu' ? 'ur' : (userLangStr === 'English' ? 'en' : null);
  
  let finalLang = 'en';
  
  if (isExplicitUpdate) {
    finalLang = dbCode || 'en';
  } else {
    finalLang = localPref || dbCode || i18n.language || 'en';
  }
  
  i18n.changeLanguage(finalLang);
  document.documentElement.dir = finalLang === 'ur' ? 'rtl' : 'ltr';
  localStorage.setItem('preferredLanguage', finalLang);
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('peanutiq_token');
      const storedUser = localStorage.getItem('peanutiq_user');
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser.language) {
          setGlobalLanguage(parsedUser.language);
        }
      }
      
      if (storedToken) {
        try {
          const res = await fetchApi('/users/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
            localStorage.setItem('peanutiq_user', JSON.stringify(data));
            if (data.language_preference) {
              setGlobalLanguage(data.language_preference, true);
            }
          }
        } catch (err) {
          console.error("Failed to fetch fresh user data", err);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // The backend's English messages that a farmer can meet here, translated.
  const describeAuthError = (detail) => {
    const known = {
      'Incorrect email or password': i18n.t('auth.app.badCredentials', 'Incorrect email or password'),
      'Email already registered': i18n.t('auth.app.emailTaken', 'An account with this email already exists'),
    };
    if (typeof detail === 'string') return known[detail] || detail;
    return i18n.t('auth.app.checkFields', 'Please check the details and try again.');
  };

  /** Creates the account. It does not sign in: the user signs in next with the password. */
  const register = async ({ name, identifier, password, farm_location, language_preference }) => {
    try {
      const response = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          identifier: identifier.trim(),
          password,
          farm_location,
          language_preference,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return { success: false, error: describeAuthError(data.detail) };
      }
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: i18n.t('auth.app.networkError', 'Network error. Please try again.') };
    }
  };

  /** Email and password sign-in. Returns the user so the caller can route by role. */
  const login = async (identifier, password) => {
    try {
      const response = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { success: false, error: describeAuthError(data.detail) };
      }
      // data contains { access_token, token_type, user }
      setUser(data.user);
      localStorage.setItem('peanutiq_user', JSON.stringify(data.user));
      localStorage.setItem('peanutiq_token', data.access_token);
      setGlobalLanguage(data.user.language_preference);
      return { success: true, user: data.user };
    } catch (error) {
      console.error(error);
      return { success: false, error: i18n.t('auth.app.networkError', 'Network error. Please try again.') };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('peanutiq_user');
    localStorage.removeItem('peanutiq_token');
  };

  const updateProfile = async (updates) => {
    try {
      const response = await fetchApi('/users/me', {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        const updatedData = await response.json();
        const updatedUser = { ...user, ...updatedData };
        setUser(updatedUser);
        localStorage.setItem('peanutiq_user', JSON.stringify(updatedUser));
        
        if (updatedUser.language_preference) {
          setGlobalLanguage(updatedUser.language_preference, true);
        }
        return { success: true };
      }
      return { success: false, error: 'Failed to update profile' };
    } catch (e) {
      return { success: false, error: 'Network error' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
