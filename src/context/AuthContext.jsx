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

  const login = async (identifier) => {
    try {
      const response = await fetchApi('/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ identifier }),
      });
      if (!response.ok) {
        throw new Error('Failed to request OTP');
      }
      return { success: true, identifier };
    } catch (error) {
      console.error(error);
      return { success: false, error: error.message };
    }
  };

  const verifyOtp = async (identifier, otp, isLoginIntent = true) => {
    try {
      const response = await fetchApi('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ identifier, otp }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.detail || 'Invalid OTP' };
      }

      // data contains { access_token, token_type, user }
      const loggedInUser = data.user;
      
      setUser(loggedInUser);
      localStorage.setItem('peanutiq_user', JSON.stringify(loggedInUser));
      localStorage.setItem('peanutiq_token', data.access_token);
      
      setGlobalLanguage(loggedInUser.language_preference);
      
      // Determine if new user based on active status or missing profile fields
      // For now we assume if they don't have a farm_location, they might need setup
      const isNewUser = !loggedInUser.farm_location && loggedInUser.role === 'farmer';
      
      return { success: true, isNewUser, user: loggedInUser };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const signup = async (profileData) => {
    // Signup flow routes to request-otp as our backend creates the user if they don't exist
    return login(profileData.identifier || profileData.email || profileData.phone);
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
    <AuthContext.Provider value={{ user, loading, login, verifyOtp, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
