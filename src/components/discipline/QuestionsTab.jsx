import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Field from '../common/Field';
import Icon from '../common/Icon';
import LoadingSpinner from '../common/LoadingSpinner';
import { EmptyState, ErrorState } from '../common/States';
import useAsync from '../../hooks/useAsync';
import useRequireAuth from '../../hooks/useRequireAuth';
import { useToast } from '../../contexts/contexts';
import { createQuestion, fetchQuestions, getErrorMessage } from '../../services/api';
import { plural, timeAgo } from '../../utils/format';

function QuestionForm({ discipline, onCancel }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    const next = {};
    if (title.trim().length < 10) next.title = 'Escreva a dúvida em pelo menos 10 caracteres';
    if (body.trim().length < 10) next.body = 'Dê um pouco mais de contexto (mínimo de 10 caracteres)';
    setErrors(next);
    if (Object.keys(next).length) return;

    setIsSending(true);
    setFormError('');
    try {
      const question = await createQuestion(discipline.code, { title: title.trim(), body: body.trim() });
      toast.success(discipline.veteranCount > 0
        ? `Pergunta publicada. Avisamos ${plural(discipline.veteranCount, 'veterano', 'veteranos')} de ${discipline.code}.`
        : 'Pergunta publicada.');
      navigate(`/perguntas/${question.id}`);
    } catch (error) {
      setFormError(getErrorMessage(error, 'Não foi possível publicar a pergunta.'));
      setIsSending(false);
    }
  }

  return (
    <section className="panel">
      <h2 className="panel__title">Nova pergunta em {discipline.code}</h2>
      <form className="form" onSubmit={submit} noValidate>
        <Field label="Sua dúvida" error={errors.title} hint="Uma frase direta. Ex.: “Dá pra pegar junto com Sistemas Operacionais?”">
          {(props) => <input {...props} maxLength={160} value={title} onChange={(e) => { setTitle(e.target.value); setErrors((c) => ({ ...c, title: undefined })); }} />}
        </Field>
        <Field label="Contexto" error={errors.body} hint="Seu período, se trabalha, qual turma está pensando em pegar…">
          {(props) => <textarea {...props} rows={4} maxLength={3000} value={body} onChange={(e) => { setBody(e.target.value); setErrors((c) => ({ ...c, body: undefined })); }} />}
        </Field>
        <p className="form__note"><Icon name="bell" /> Quem tem selo de veterano em {discipline.code} será notificado. A pergunta e as respostas ficam públicas.</p>
        {formError && <p className="form__error" role="alert">{formError}</p>}
        <div className="form__actions">
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" isLoading={isSending}>Publicar pergunta</Button>
        </div>
      </form>
    </section>
  );
}

/**
 * Perguntas e respostas da disciplina, pesquisáveis (RF06/US03).
 */
export default function QuestionsTab({ discipline }) {
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [onlyUnanswered, setOnlyUnanswered] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const requireAuth = useRequireAuth();

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(draft.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [draft]);

  const { data, error, isLoading, reload } = useAsync(
    () => fetchQuestions(discipline.code, { q: query, filter: onlyUnanswered ? 'unanswered' : '' }),
    [discipline.code, query, onlyUnanswered],
  );

  function ask() {
    if (requireAuth('para perguntar')) setIsAsking(true);
  }

  return (
    <div className="tab-panel">
      {isAsking && <QuestionForm discipline={discipline} onCancel={() => setIsAsking(false)} />}

      <div className="tab-toolbar">
        <div className="tab-toolbar__filters">
          <label className="filters__search filters__search--compact">
            <Icon name="search" />
            <input type="search" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Buscar nas perguntas e respostas" aria-label="Buscar nas perguntas e respostas" />
          </label>
          <label className="checkbox">
            <input type="checkbox" checked={onlyUnanswered} onChange={(e) => setOnlyUnanswered(e.target.checked)} />
            Só sem resposta
          </label>
        </div>
        {!isAsking && <Button onClick={ask}><Icon name="plus" /> Fazer pergunta</Button>}
      </div>

      {isLoading && !data && <LoadingSpinner message="Carregando perguntas..." />}
      {error && <ErrorState error={error} onRetry={reload} />}

      {data && data.length === 0 && (
        query || onlyUnanswered ? (
          <EmptyState title="Nada encontrado" icon="search">
            {query ? <>Ninguém perguntou sobre “{query}” ainda. Que tal ser o primeiro?</> : 'Todas as perguntas desta disciplina já têm resposta.'}
          </EmptyState>
        ) : (
          <EmptyState title="Nenhuma pergunta ainda" icon="message" action={!isAsking && <Button onClick={ask}>Fazer a primeira pergunta</Button>}>
            Dúvida sobre a prova, a carga ou o professor? Veteranos de {discipline.code} recebem um aviso quando você pergunta.
          </EmptyState>
        )
      )}

      {data && data.length > 0 && (
        <ul className={`question-list ${isLoading ? 'is-refreshing' : ''}`}>
          {data.map((q) => (
            <li key={q.id}>
              <Link to={`/perguntas/${q.id}`} className="question-row">
                <span className={`question-row__count ${q.answerCount === 0 ? 'is-empty' : ''} ${q.hasBestAnswer ? 'is-solved' : ''}`}>
                  <strong>{q.answerCount}</strong>
                  <small>{q.answerCount === 1 ? 'resposta' : 'respostas'}</small>
                </span>
                <span className="question-row__body">
                  <span className="question-row__title">{q.title}</span>
                  <span className="question-row__excerpt">{q.body}</span>
                  <span className="question-row__meta">
                    {q.author.name} · {timeAgo(q.createdAt)}
                    {q.hasBestAnswer && <span className="badge badge--solved"><Icon name="check" /> Resolvida</span>}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
