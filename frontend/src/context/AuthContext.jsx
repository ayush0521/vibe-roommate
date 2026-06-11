import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, usersAPI } from '../services/api';
import { initSocket, disconnectSocket } from '../socket/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null); // auth user
  const [profile, setProfile] = useState(null); // user profile
  const [loading, setLoading] = useState(true);

  // Load user from the httpOnly cookie (server validates it via /api/auth/me)
  const loadUser = useCallback(async () => {
    try {
      const { data } = await authAPI.me();
      setUser(data.data.auth);
      setProfile(data.data.profile);
      // Note: getMe does NOT return a token (no need — cookie is auto-sent)
      // Socket is initialized separately during login/register when token is available
    } catch {
      // 401 — cookie is missing, expired, or invalidated — user is logged out
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    setUser(data.user);
    if (data.token) initSocket(data.token);
    await loadUser();
    return data;
  };

  const register = async (credentials) => {
    const { data } = await authAPI.register(credentials);
    setUser(data.user);
    if (data.token) initSocket(data.token);
    await loadUser();
    return data;
  };

  const googleLogin = async (credential) => {
    const { data } = await authAPI.googleAuth({ credential });
    setUser(data.user);
    initSocket(data.token);
    await loadUser();
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout(); // Server clears cookie + adds token to blocklist
    } catch {
      // Still clear local state even if server call fails
    }
    // Clear any legacy localStorage items
    localStorage.removeItem('vr_token');
    localStorage.removeItem('vr_user');
    setUser(null);
    setProfile(null);
    disconnectSocket();
    window.location.href = '/';
  };

  const refreshProfile = async () => {
    try {
      const { data } = await usersAPI.getMe();
      setProfile(data.data);
      return data.data;
    } catch (err) {
      console.error('Failed to refresh profile', err);
    }
  };

  const isAuthenticated   = !!user;
  const isProfileComplete = profile?.isProfileComplete || false;
  const hasCompletedQuiz  = profile?.hasCompletedQuiz || false;

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      login, register, googleLogin, logout, refreshProfile,
      isAuthenticated, isProfileComplete, hasCompletedQuiz,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
