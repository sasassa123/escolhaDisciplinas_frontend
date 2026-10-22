import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Field from '../components/common/Field';
import Icon from '../components/common/Icon';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useAuth, useMeta, useToast } from '../contexts/contexts';
import { getErrorMessage, register, resendConfirmation } from '../services/api';

/**
 * Cadastro restrito ao e-mail institucional, com confirmação por link (RF01).
 */
export default function Register() {
  useDocumentTitle('Criar conta');
  const { user } = useAuth();
  const { meta } = useMeta();
  const toast = useToast();
  const [values, setValues] = useState({ name: '', email: '', period: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(null);

  if (user && !sent) return <Navigate to="/perfil" replace />;

  const domain = meta?.emailDomain || '';

  function set(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate() {
    const next = {};
    const email = values.email.trim().toLowerCase();
    if (values.name.trim().length < 3) next.name = 'Informe seu nome';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Informe um e-mail válido';
    else if (domain && !(email.endsWith(`@${domain}`) || email.split('@')[1].endsWith(`.${domain}`))) {
      next.email = `Precisa ser o e-mail da faculdade, terminado em @${domain}`;
    }
    if (!values.period) next.period = 'Escolha seu período';
    if (values.password.length < 8) next.password = 'Use pelo menos 8 caracteres';
    if (values.confirm !== values.password) next.confirm = 'As senhas não conferem';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    setFormError('');
    if (!validate()) return;
    setIsSending(true);
    try {
      const result = await register({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        period: Number(values.period),
        password: values.password,
      });
      setSent(result);
    } catch (err) {
      setFormError(getErrorMessage(err, 'Não foi possível criar a conta.'));
    } finally {
      setIsSending(false);
    }
  }

  async function resend() {
    try {
      const result = await resendConfirmation(sent.email);
      setSent((current) => ({ ...current, ...result }));
      toast.success(result.message);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (sent) {
    return (
      <main className="page auth-page">
        <div className="auth-card auth-card--center">
          <span className="auth-card__icon"><Icon name="message" /></span>
          <h1 className="page-title">Confira seu e-mail</h1>
          <p className="lead">
            Enviamos um link de confirmação para <strong>{sent.email}</strong>. Clique nele para ativar sua conta —
            é assim que garantimos que só alunos de verdade publicam no acervo.
          </p>
          {sent.devConfirmationUrl && (
            <div className="dev-mail">
              <p className="dev-mail__label">E-mail simulado — ambiente de desenvolvimento</p>
              <p className="dev-mail__subject">Assunto: Confirme sua conta no Acervo</p>
              <p>Olá, {values.name.split(' ')[0]}! Confirme seu e-mail para começar a contribuir.</p>
              <Button href={sent.devConfirmationUrl} size="sm">Confirmar meu e-mail</Button>
            </div>
          )}
          <p className="auth-card__switch">Não chegou? <button type="button" className="text-action" onClick={resend}>Reenviar link</button></p>
        </div>
      </main>
    );
  }

  return (
    <main className="page auth-page">
      <div className="auth-card">
        <p className="kicker">Só para alunos{meta ? ` do ${meta.institution}` : ''}</p>
        <h1 className="page-title">Criar conta</h1>
        <p className="lead">Qualquer pessoa pode ler o acervo. Para enviar materiais, avaliar e perguntar, cadastre-se com o e-mail da faculdade.</p>

        <form className="form" onSubmit={submit} noValidate>
          <Field label="Nome" error={errors.name} hint="É assim que você aparece nas suas contribuições.">
            {(props) => <input {...props} autoComplete="name" maxLength={80} value={values.name} onChange={(e) => set('name', e.target.value)} />}
          </Field>
          <Field label="E-mail institucional" error={errors.email} hint={domain ? `Termina em @${domain}` : undefined}>
            {(props) => <input {...props} type="email" autoComplete="email" value={values.email} onChange={(e) => set('email', e.target.value)} placeholder={domain ? `seu.nome@${domain}` : ''} />}
          </Field>
          <Field label="Período atual" error={errors.period}>
            {(props) => (
              <select {...props} value={values.period} onChange={(e) => set('period', e.target.value)}>
                <option value="">Escolha…</option>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((p) => <option key={p} value={p}>{p}º período</option>)}
              </select>
            )}
          </Field>
          <div className="form__row">
            <Field label="Senha" error={errors.password} hint="Mínimo de 8 caracteres">
              {(props) => <input {...props} type="password" autoComplete="new-password" value={values.password} onChange={(e) => set('password', e.target.value)} />}
            </Field>
            <Field label="Repita a senha" error={errors.confirm}>
              {(props) => <input {...props} type="password" autoComplete="new-password" value={values.confirm} onChange={(e) => set('confirm', e.target.value)} />}
            </Field>
          </div>
          {formError && <p className="form__error" role="alert">{formError}</p>}
          <Button type="submit" isLoading={isSending} className="button--block">Criar conta</Button>
        </form>

        <p className="auth-card__switch">Já tem conta? <Link to="/entrar">Entrar</Link></p>
      </div>
    </main>
  );
}
