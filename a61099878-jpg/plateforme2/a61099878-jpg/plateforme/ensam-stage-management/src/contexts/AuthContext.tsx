import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, type AuthUser } from '@/lib/api';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, role: 'admin' | 'student') => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if app should force logout on restart
    const shouldForceLogout = localStorage.getItem('force_logout_on_restart');
    const lastActivityTime = localStorage.getItem('last_activity_time');
    const currentTime = Date.now();
    
    // Update last activity time
    localStorage.setItem('last_activity_time', currentTime.toString());
    
    if (shouldForceLogout === 'true') {
      // Only force logout if it's been more than 30 seconds since last activity
      // This differentiates between app restart (long gap) and page refresh (short gap)
      const timeSinceLastActivity = lastActivityTime ? currentTime - parseInt(lastActivityTime) : 0;
      
      if (timeSinceLastActivity > 30000) { // 30 seconds
        // Force logout and clear everything (real app restart)
        api.clearToken();
        localStorage.removeItem('force_logout_on_restart');
        setUser(null);
        setLoading(false);
        return;
      } else {
        // Page refresh - don't force logout but clear the flag
        localStorage.removeItem('force_logout_on_restart');
      }
    }

    // Verify token on app start
    const verifyToken = async () => {
      try {
        // Check if token exists
        const token = localStorage.getItem('auth_token');
        const tokenTimestamp = localStorage.getItem('auth_token_timestamp');
        
        if (!token) {
          throw new Error('No token found');
        }
        
        // Check token age (24 hours max)
        if (tokenTimestamp) {
          const tokenAge = Date.now() - parseInt(tokenTimestamp);
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours
          if (tokenAge > maxAge) {
            throw new Error('Token expired');
          }
        }
        
        const response = await api.verifyToken();
        
        // Verify user data consistency with enhanced checks
        const cachedUser = localStorage.getItem('user_data');
        if (cachedUser) {
          const parsedCachedUser = JSON.parse(cachedUser);
          
          // Check for user ID mismatch
          if (parsedCachedUser.id !== response.user.id) {
            console.error('User ID mismatch detected:', parsedCachedUser.id, 'vs', response.user.id);
            throw new Error('User data mismatch - security issue');
          }
          
          // Check for role mismatch
          if (parsedCachedUser.role !== response.user.role) {
            console.error('User role mismatch detected:', parsedCachedUser.role, 'vs', response.user.role);
            throw new Error('User role mismatch - security issue');
          }
          
          // Check for email mismatch
          if (parsedCachedUser.email !== response.user.email) {
            console.error('User email mismatch detected:', parsedCachedUser.email, 'vs', response.user.email);
            throw new Error('User email mismatch - security issue');
          }
        }
        
        setUser(response.user);
      } catch (error) {
        console.log('Token verification failed:', error);
        api.clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (email: string, password: string, role: 'admin' | 'student') => {
    try {
      // Clear all existing user state and cache BEFORE new login
      setUser(null);
      api.clearToken();
      
      const response = await api.login(email, password, role);
      
      // Immediately set the new user with fresh data
      setUser(response.user);
      
      // Double-check that the cached user data matches
      const cachedUser = localStorage.getItem('user_data');
      if (cachedUser) {
        const parsedCachedUser = JSON.parse(cachedUser);
        if (parsedCachedUser.id !== response.user.id) {
          console.error('User cache mismatch detected! Clearing and retrying...');
          api.clearToken();
          setUser(null);
          throw new Error('Erreur de cache utilisateur - veuillez réessayer');
        }
      }
      
      // CRITICAL: Force complete page reload and redirect to avoid any cache issues
      // Small delay to ensure token is properly saved
      setTimeout(() => {
        const targetUrl = response.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
        console.log(`🔄 Sécurité: Rechargement forcé pour ${response.user.name} vers ${targetUrl}`);
        window.location.href = targetUrl;
      }, 100);
      
    } catch (error) {
      // Ensure clean state on error
      setUser(null);
      api.clearToken();
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      // Clear any existing token/user data first
      api.clearToken();
      setUser(null);
      
      // Register new account
      await api.register(email, password);
      
      // Automatically login the user after successful registration
      const response = await api.login(email, password, 'student');
      setUser(response.user);
    } catch (error) {
      // If register succeeded but login failed, clear everything
      api.clearToken();
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    
    // Set flag to force logout on next app restart (sécurisée par défaut)
    // Also set current time to help differentiate restart vs refresh
    localStorage.setItem('force_logout_on_restart', 'true');
    localStorage.setItem('last_activity_time', Date.now().toString());
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}