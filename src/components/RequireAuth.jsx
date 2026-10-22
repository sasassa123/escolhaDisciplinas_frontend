import { Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from './common/LoadingSpinner';
import { useAuth } from '../contexts/contexts';

/**
 * Protege rotas que exigem login (e, opcionalmente, perfil de moderador).
 */
export default function RequireAuth({ children, moderator = false }) {
  const { user, isLoading, isModerator } = useAuth();
  const location = useLocation();

  if (isLoading) return <main className="page"><LoadingSpinner message="Verificando sua sessão..." /></main>;
  if (!user) return <Navigate to={`/entrar?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (moderator && !isModerator) {
    return (
      <main className="page page--narrow">
        <h1 className="page-title">Área restrita</h1>
        <p className="lead">O painel de moderação é exclusivo para moderadores do portal.</p>
      </main>
    );
  }
  return children;
}
