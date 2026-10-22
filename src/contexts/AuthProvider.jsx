import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './contexts';
import * as apiService from '../services/api';

/**
 * Guarda o usuário logado. O token fica no localStorage e é enviado
 * automaticamente pelo interceptor do Axios (services/api.js).
 */
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(apiService.getStoredToken()));

  useEffect(() => {
    if (!apiService.getStoredToken()) return undefined;
    let ignore = false;
    apiService.fetchMe()
      .then((profile) => { if (!ignore) setUser(profile); })
      .catch(() => { if (!ignore) apiService.storeToken(null); })
      .finally(() => { if (!ignore) setIsLoading(false); });
    return () => { ignore = true; };
  }, []);

  // Disparado pelo interceptor quando a API responde 401 com token salvo
  useEffect(() => {
    const handleUnauthorized = () => {
      apiService.storeToken(null);
      setUser(null);
    };
    window.addEventListener('portal:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('portal:unauthorized', handleUnauthorized);
  }, []);

  const startSession = useCallback(async (token) => {
    apiService.storeToken(token);
    const profile = await apiService.fetchMe();
    setUser(profile);
    return profile;
  }, []);

  const login = useCallback(async (email, password) => {
    const { token } = await apiService.login(email, password);
    return startSession(token);
  }, [startSession]);

  const logout = useCallback(async () => {
    try {
      await apiService.logout();
    } catch {
      // Mesmo se a API falhar, a sessão local é encerrada
    }
    apiService.storeToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const profile = await apiService.fetchMe();
    setUser(profile);
    return profile;
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    isModerator: user?.role === 'moderator',
    login,
    logout,
    startSession,
    refreshUser,
    setUser,
  }), [user, isLoading, login, logout, startSession, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
