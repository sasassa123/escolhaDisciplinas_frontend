import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useAuth, useToast } from '../contexts/contexts';
import { confirmEmail, getErrorMessage } from '../services/api';

/**
 * Destino do link enviado por e-mail: confirma a conta e já inicia a sessão.
 */
export default function ConfirmEmail() {
  useDocumentTitle('Confirmar e-mail');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { startSession } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState(token ? '' : 'Link de confirmação incompleto.');
  const started = useRef(false);

  useEffect(() => {
    // Evita confirmar duas vezes no StrictMode (o token só vale uma vez)
    if (!token || started.current) return;
    started.current = true;
    confirmEmail(token)
      .then(async (result) => {
        await startSession(result.token);
        toast.success('E-mail confirmado! Agora conte quais disciplinas você já cursou.');
        navigate('/perfil?bemvindo=1', { replace: true });
      })
      .catch((err) => setError(getErrorMessage(err, 'Não foi possível confirmar o e-mail.')));
  }, [token, startSession, toast, navigate]);

  return (
    <main className="page auth-page">
      <div className="auth-card auth-card--center">
        {error ? (
          <>
            <h1 className="page-title">Link inválido</h1>
            <p className="lead">{error} Se você já confirmou, é só entrar.</p>
            <Button to="/entrar">Ir para o login</Button>
          </>
        ) : (
          <LoadingSpinner message="Confirmando seu e-mail..." />
        )}
      </div>
    </main>
  );
}
