import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../contexts/contexts';

/**
 * Devolve uma função que verifica se há usuário logado antes de uma ação.
 * Sem login, avisa e manda para /entrar, voltando para a página atual depois.
 *
 * const requireAuth = useRequireAuth();
 * if (!requireAuth('para votar')) return;
 */
export default function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback((reason = 'para continuar') => {
    if (isAuthenticated) return true;
    toast.info(`Entre com seu e-mail institucional ${reason}.`);
    navigate(`/entrar?next=${encodeURIComponent(location.pathname + location.search)}`);
    return false;
  }, [isAuthenticated, toast, navigate, location]);
}
