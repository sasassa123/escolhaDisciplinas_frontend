import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/common/Button';
import Field from '../components/common/Field';
import Icon from '../components/common/Icon';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AuthorLine from '../components/common/AuthorLine';
import VoteControl from '../components/common/VoteControl';
import ReportButton from '../components/common/ReportButton';
import { EmptyState, ErrorState } from '../components/common/States';
import useAsync from '../hooks/useAsync';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useAuth, useToast } from '../contexts/contexts';
import {
  createAnswer, deleteAnswer, deleteQuestion, fetchQuestion, getErrorMessage, markBestAnswer, voteAnswer,
} from '../services/api';
import { plural } from '../utils/format';
import NotFound from './NotFound';

function sortAnswers(answers) {
  return [...answers].sort((a, b) => (Number(b.isBest) - Number(a.isBest)) || (b.score - a.score) || a.createdAt.localeCompare(b.createdAt));
}

function AnswerItem({ answer, canChooseBest, onChange, onBest, onDelete }) {
  return (
    <li className={`answer ${answer.isBest ? 'answer--best' : ''}`} id={`resposta-${answer.id}`}>
      <VoteControl item={answer} onVote={(value) => voteAnswer(answer.id, value)} onChange={onChange} />
      <div className="answer__body">
        {answer.isBest && <p className="answer__best-label"><Icon name="check" /> Melhor resposta, escolhida por quem perguntou</p>}
        <p className="answer__text">{answer.body}</p>
        <div className="answer__footer">
          <AuthorLine author={answer.author} date={answer.createdAt} />
          <div className="answer__actions">
            {canChooseBest && (
              <button type="button" className={`text-action ${answer.isBest ? 'text-action--muted' : ''}`} onClick={() => onBest(answer)}>
                <Icon name={answer.isBest ? 'close' : 'check'} /> {answer.isBest ? 'Desmarcar melhor' : 'Marcar como melhor'}
              </button>
            )}
            {answer.isMine
              ? <button type="button" className="text-action text-action--muted" onClick={() => onDelete(answer)}><Icon name="trash" /> Excluir</button>
              : <ReportButton targetType="answer" targetId={answer.id} />}
          </div>
        </div>
      </div>
    </li>
  );
}

/**
 * Pergunta com as respostas: a melhor resposta (marcada pelo autor) aparece no topo (US03).
 */
export default function QuestionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: question, error, isLoading, reload, setData } = useAsync(() => fetchQuestion(id), [id, user?.id]);
  const [body, setBody] = useState('');
  const [answerError, setAnswerError] = useState('');
  const [isSending, setIsSending] = useState(false);
  useDocumentTitle(question?.title || 'Pergunta');

  // Links da busca apontam para uma resposta específica (#resposta-12)
  const questionId = question?.id;
  useEffect(() => {
    if (questionId && location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'center' });
  }, [questionId, location.hash]);

  if (error?.response?.status === 404) return <NotFound message="Essa pergunta não existe ou foi removida." />;
  if (error) return <main className="page"><ErrorState error={error} onRetry={reload} /></main>;
  if (isLoading && !question) return <main className="page"><LoadingSpinner message="Carregando pergunta..." /></main>;

  const canChooseBest = question.isMine;

  function updateAnswers(transform) {
    setData((current) => {
      const answers = sortAnswers(transform(current.answers));
      return { ...current, answers, answerCount: answers.length, hasBestAnswer: answers.some((a) => a.isBest) };
    });
  }

  async function submitAnswer(event) {
    event.preventDefault();
    if (body.trim().length < 10) {
      setAnswerError('Escreva pelo menos 10 caracteres.');
      return;
    }
    setIsSending(true);
    setAnswerError('');
    try {
      const created = await createAnswer(question.id, body.trim());
      updateAnswers((answers) => [...answers, created]);
      setBody('');
      toast.success('Resposta publicada. Valeu por ajudar!');
      window.setTimeout(() => document.getElementById(`resposta-${created.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
    } catch (err) {
      setAnswerError(getErrorMessage(err, 'Não foi possível publicar a resposta.'));
    } finally {
      setIsSending(false);
    }
  }

  async function chooseBest(answer) {
    try {
      const updated = await markBestAnswer(question.id, answer.isBest ? null : answer.id);
      setData((current) => ({ ...current, ...updated }));
      toast.success(answer.isBest ? 'Marcação removida.' : 'Resposta marcada como a melhor. Ela agora aparece no topo.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function removeAnswer(answer) {
    if (!window.confirm('Excluir sua resposta?')) return;
    try {
      await deleteAnswer(answer.id);
      updateAnswers((answers) => answers.filter((a) => a.id !== answer.id));
      toast.success('Resposta excluída.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function removeQuestion() {
    if (!window.confirm('Excluir esta pergunta e todas as respostas dela?')) return;
    try {
      await deleteQuestion(question.id);
      toast.success('Pergunta excluída.');
      navigate(`/disciplinas/${question.disciplineCode}?aba=perguntas`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <main className="page page--reading">
      <nav className="breadcrumb" aria-label="Você está em">
        <Link to="/disciplinas">Disciplinas</Link>
        <Icon name="chevron" />
        <Link to={`/disciplinas/${question.discipline.code}`}>{question.discipline.code}</Link>
        <Icon name="chevron" />
        <Link to={`/disciplinas/${question.discipline.code}?aba=perguntas`}>Perguntas</Link>
      </nav>

      <article className="question">
        <p className="kicker">Pergunta em {question.discipline.code} · {question.discipline.name}</p>
        <h1 className="question__title">{question.title}</h1>
        <p className="question__body">{question.body}</p>
        <div className="question__footer">
          <AuthorLine author={question.author} date={question.createdAt} prefix="Perguntado por" />
          {question.isMine
            ? <button type="button" className="text-action text-action--muted" onClick={removeQuestion}><Icon name="trash" /> Excluir pergunta</button>
            : <ReportButton targetType="question" targetId={question.id} />}
        </div>
      </article>

      <section className="answers" aria-labelledby="answers-title">
        <h2 id="answers-title" className="answers__title">{plural(question.answerCount, 'resposta', 'respostas')}</h2>
        {canChooseBest && question.answerCount > 0 && !question.hasBestAnswer && (
          <p className="notice"><Icon name="check" /> Alguma resposta resolveu sua dúvida? Marque como a melhor — ela passa a aparecer no topo para quem vier depois.</p>
        )}
        {question.answers.length === 0 ? (
          <EmptyState title="Ainda sem respostas" icon="message">
            Os veteranos de {question.discipline.code} foram avisados. Enquanto isso, veja os <Link to={`/disciplinas/${question.discipline.code}?aba=materiais`}>materiais</Link> e as <Link to={`/disciplinas/${question.discipline.code}?aba=avaliacoes`}>avaliações</Link>.
          </EmptyState>
        ) : (
          <ol className="answer-list">
            {question.answers.map((answer) => (
              <AnswerItem
                key={answer.id}
                answer={answer}
                canChooseBest={canChooseBest}
                onChange={(updated) => updateAnswers((answers) => answers.map((a) => (a.id === updated.id ? updated : a)))}
                onBest={chooseBest}
                onDelete={removeAnswer}
              />
            ))}
          </ol>
        )}
      </section>

      <section className="panel answer-composer">
        {user ? (
          <form className="form" onSubmit={submitAnswer} noValidate>
            <h2 className="panel__title">Sua resposta</h2>
            {question.viewerIsVeteran
              ? <p className="form__note"><Icon name="star" /> Você é veterano nesta disciplina — sua resposta aparece com o selo.</p>
              : <p className="form__note">Você ainda não marcou {question.discipline.code} como cursada. Tudo bem responder, mas seja claro sobre de onde vem a informação.</p>}
            <Field label="Resposta" error={answerError}>
              {(props) => <textarea {...props} rows={5} maxLength={4000} value={body} onChange={(e) => { setBody(e.target.value); setAnswerError(''); }} placeholder="Conte o que você sabe por experiência própria…" />}
            </Field>
            <div className="form__actions">
              <Button type="submit" isLoading={isSending}>Publicar resposta</Button>
            </div>
          </form>
        ) : (
          <div className="callout">
            <p><strong>Sabe a resposta?</strong> Entre com o e-mail institucional para responder.</p>
            <Button size="sm" to={`/entrar?next=${encodeURIComponent(location.pathname)}`}>Entrar para responder</Button>
          </div>
        )}
      </section>
    </main>
  );
}
