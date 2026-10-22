import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/common/Button';
import Field from '../components/common/Field';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useAuth, useMeta, useToast } from '../contexts/contexts';
import { getErrorMessage, resendConfirmation } from '../services/api';

// Contas do seed da API (veja src/data/seed.js no repositório da API). Só aparecem em desenvolvimento.
const DEMO_PASSWORD = 'patinete123';
const DEMO_ACCOUNTS = [
  { handle: 'lucas.prado', name: 'Lucas Prado', role: 'Calouro, 2º período' },
  { handle: 'rafael.lins', name: 'Rafael Lins', role: 'Veterano, 7º período' },
  { handle: 'moderacao', name: 'Mariana Couto', role: 'Moderadora' },
];

/** Só aceita caminhos internos no ?next= para não redirecionar para outro site. */
function safeNext(value) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

export default function Login() {
  useDocumentTitle('Entrar');
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get('next'));
  const { login, user } = useAuth();
  const { meta } = useMeta();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [devLink, setDevLink] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (user) return <Navigate to={next} replace />;

  async function submit(event) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setIsSending(true);
    setError('');
    setNeedsConfirmation(false);
    try {
      const profile = await login(email.trim(), password);
      toast.success(`Olá, ${profile.name.split(' ')[0]}!`);
      navigate(next, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível entrar.'));
      setNeedsConfirmation(err.response?.data?.details?.includes('email_not_confirmed'));
      setIsSending(false);
    }
  }

  async function resend() {
    try {
      const result = await resendConfirmation(email.trim());
      toast.success(result.message);
      if (result.devConfirmationUrl) setDevLink(result.devConfirmationUrl);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  function fillDemo(account) {
    setEmail(`${account.handle}@${meta?.emailDomain}`);
    setPassword(DEMO_PASSWORD);
    setError('');
  }

  return (
    <main className="page auth-page">
      <div className="auth-card">
        <p className="kicker">Bem-vindo de volta</p>
        <h1 className="page-title">Entrar no acervo</h1>
        <p className="lead">Use seu e-mail institucional{meta ? ` (@${meta.emailDomain})` : ''}.</p>

        <form className="form" onSubmit={submit} noValidate>
          <Field label="E-mail institucional">
            {(props) => <input {...props} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={meta ? `seu.nome@${meta.emailDomain}` : ''} />}
          </Field>
          <Field label="Senha">
            {(props) => <input {...props} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />}
          </Field>
          {error && (
            <div className="form__error" role="alert">
              <p>{error}</p>
              {needsConfirmation && <button type="button" className="text-action" onClick={resend}>Reenviar link de confirmação</button>}
            </div>
          )}
          {devLink && (
            <div className="dev-mail">
              <p className="dev-mail__label">E-mail simulado (ambiente de desenvolvimento)</p>
              <a href={devLink}>Abrir link de confirmação</a>
            </div>
          )}
          <Button type="submit" isLoading={isSending} className="button--block">Entrar</Button>
        </form>

        <p className="auth-card__switch">Primeira vez aqui? <Link to="/cadastro">Criar conta com e-mail da faculdade</Link></p>
      </div>

      {import.meta.env.DEV && meta && (
        <aside className="demo-accounts" aria-label="Contas de demonstração">
          <p className="demo-accounts__title">Contas de demonstração</p>
          <p className="demo-accounts__text">Dados de exemplo da API para testar os diferentes perfis. Clique para preencher.</p>
          <ul>
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.handle}>
                <button type="button" onClick={() => fillDemo(account)}>
                  <strong>{account.name}</strong>
                  <span>{account.role}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </main>
  );
}
