import { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';

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

  // Mock checking local storage for session
  useEffect(() => {
    const storedUser = localStorage.getItem('peanutiq_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.language) {
        setGlobalLanguage(parsedUser.language);
      }
    }
    setLoading(false);
  }, []);

  const login = async (identifier) => {
    // In a real app, this sends OTP to phone/email
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, identifier });
      }, 1000);
    });
  };

  const verifyOtp = async (identifier, otp, isLoginIntent = true) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock verification logic
        if (otp.length === 6) {
          // Check if user exists (mock logic based on identifier)
          if (identifier === 'admin@peanutiq.pk' || identifier === '923000000000') {
            const adminUser = {
              id: 1,
              name: 'System Admin',
              email: identifier,
              role: 'admin',
              language: 'English',
              token: 'mock-jwt-token-admin'
            };
            setUser(adminUser);
            localStorage.setItem('peanutiq_user', JSON.stringify(adminUser));
            
            // Enforce user's language preference
            setGlobalLanguage(adminUser.language);
            
            resolve({ success: true, isNewUser: false, user: adminUser });
          } else if (identifier === 'researcher@peanutiq.pk' || identifier === '923000000001') {
            const researcherUser = {
              id: 2,
              name: 'Dr. Faisal (Researcher)',
              email: identifier,
              role: 'researcher',
              language: 'English',
              token: 'mock-jwt-token-researcher'
            };
            setUser(researcherUser);
            localStorage.setItem('peanutiq_user', JSON.stringify(researcherUser));
            
            // Enforce user's language preference
            setGlobalLanguage(researcherUser.language);
            
            resolve({ success: true, isNewUser: false, user: researcherUser });
          } else if (isLoginIntent) {
            // Mock returning user since they clicked "Sign In"
            const returningUser = {
              id: Date.now(),
              name: 'Returning Farmer',
              email: identifier.includes('@') ? identifier : '',
              location: 'Attock, Punjab',
              cropType: 'Peanut',
              language: 'Urdu', // Changed to Urdu for demonstration purposes
              role: 'farmer',
              token: 'mock-jwt-token-user'
            };
            setUser(returningUser);
            localStorage.setItem('peanutiq_user', JSON.stringify(returningUser));
            
            // Enforce user's language preference
            setGlobalLanguage(returningUser.language);
            
            resolve({ success: true, isNewUser: false, user: returningUser });
          } else {
            // New user scenario since they clicked "Sign Up"
            resolve({ success: true, isNewUser: true });
          }
        } else {
          resolve({ success: false, error: 'Invalid OTP' });
        }
      }, 1000);
    });
  };

  const signup = async (profileData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          id: Date.now(),
          ...profileData,
          token: 'mock-jwt-token-user'
        };
        setUser(newUser);
        localStorage.setItem('peanutiq_user', JSON.stringify(newUser));
        
        // Enforce user's language preference upon signup completion
        setGlobalLanguage(newUser.language);
        
        resolve({ success: true, user: newUser });
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('peanutiq_user');
  };

  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('peanutiq_user', JSON.stringify(updatedUser));
    
    if (updates.language) {
      setGlobalLanguage(updates.language, true);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyOtp, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
