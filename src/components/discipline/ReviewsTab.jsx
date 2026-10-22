import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../common/Button';
import Icon from '../common/Icon';
import LoadingSpinner from '../common/LoadingSpinner';
import ScoreMeter from '../common/ScoreMeter';
import AuthorLine from '../common/AuthorLine';
import ReportButton from '../common/ReportButton';
import { EmptyState, ErrorState } from '../common/States';
import ReviewForm from './ReviewForm';
import useAsync from '../../hooks/useAsync';
import { useAuth, useToast } from '../../contexts/contexts';
import { deleteReview, fetchReviews, getErrorMessage, updateMe } from '../../services/api';
import { plural } from '../../utils/format';

function ReviewItem({ review, onDelete }) {
  return (
    <li className="review">
      <div className="review__scores">
        <ScoreMeter value={review.difficulty} kind="difficulty" compact />
        <ScoreMeter value={review.workload} kind="workload" compact />
      </div>
      <p className="review__comment">{review.comment}</p>
      <div className="review__footer">
        <AuthorLine
          author={review.author}
          date={review.updatedAt}
          extra={<span className="author-line__context">· cursou em {review.semester} com {review.professor}</span>}
        />
        {review.isMine
          ? <button type="button" className="text-action text-action--muted" onClick={() => onDelete(review)}><Icon name="trash" /> Excluir</button>
          : <ReportButton targetType="review" targetId={review.id} />}
      </div>
    </li>
  );
}

/**
 * Avaliações de quem já cursou (RF05/US01). Só veteranos da disciplina avaliam;
 * quem ainda não marcou a disciplina como cursada pode fazer isso aqui mesmo.
 */
export default function ReviewsTab({ discipline, onChanged }) {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [professor, setProfessor] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  const { data, error, isLoading, reload, setData } = useAsync(
    () => fetchReviews(discipline.code, { professor }),
    [discipline.code, professor],
  );

  const isVeteran = Boolean(user?.completedDisciplines.includes(discipline.code));
  const myReview = data?.find((r) => r.isMine);

  async function markAsCompleted() {
    setIsMarking(true);
    try {
      const updated = await updateMe({ completedDisciplines: [...user.completedDisciplines, discipline.code] });
      setUser(updated);
      toast.success(`Selo de veterano em ${discipline.code} adicionado ao seu perfil.`);
      setIsEditing(true);
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsMarking(false);
    }
  }

  function handleSaved() {
    setIsEditing(false);
    reload();
    onChanged();
  }

  async function handleDelete(review) {
    if (!window.confirm('Excluir sua avaliação? Ela sai das médias da disciplina.')) return;
    try {
      await deleteReview(review.id);
      setData((current) => current.filter((r) => r.id !== review.id));
      onChanged();
      toast.success('Avaliação excluída.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  let callout = null;
  if (!user) {
    callout = (
      <div className="callout">
        <p><strong>Já cursou {discipline.code}?</strong> Sua avaliação ajuda quem está montando a grade.</p>
        <Button size="sm" to={`/entrar?next=${encodeURIComponent(location.pathname + location.search)}`}>Entrar para avaliar</Button>
      </div>
    );
  } else if (!isVeteran) {
    callout = (
      <div className="callout">
        <p>
          <strong>Só quem já cursou pode avaliar.</strong> Se você já fez {discipline.code}, marque como cursada —
          você ganha o selo de veterano nela e passa a ser avisado das novas dúvidas.
        </p>
        <Button size="sm" variant="secondary" onClick={markAsCompleted} isLoading={isMarking}><Icon name="star" /> Já cursei esta disciplina</Button>
      </div>
    );
  } else if (!isEditing && data) {
    callout = (
      <div className="callout callout--veteran">
        <p>
          {myReview
            ? <>Você avaliou esta disciplina em {myReview.semester}. Mudou de ideia?</>
            : <><strong>Você é veterano em {discipline.code}.</strong> Conte como foi para quem vem depois.</>}
        </p>
        <Button size="sm" variant={myReview ? 'secondary' : 'primary'} onClick={() => setIsEditing(true)}>
          {myReview ? <><Icon name="edit" /> Editar minha avaliação</> : 'Avaliar disciplina'}
        </Button>
      </div>
    );
  }

  return (
    <div className="tab-panel">
      {isEditing && isVeteran ? (
        <section className="panel">
          <h2 className="panel__title">{myReview ? 'Editar avaliação' : `Avaliar ${discipline.name}`}</h2>
          <ReviewForm discipline={discipline} existing={myReview} onSaved={handleSaved} onCancel={() => setIsEditing(false)} />
        </section>
      ) : callout}

      <div className="tab-toolbar">
        <p className="results-bar">{data ? plural(data.length, 'avaliação', 'avaliações') : ' '}</p>
        <label className="select-inline">
          <span>Professor</span>
          <select value={professor} onChange={(e) => setProfessor(e.target.value)}>
            <option value="">Todos</option>
            {discipline.professors.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
      </div>

      {isLoading && !data && <LoadingSpinner message="Carregando avaliações..." />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && data.length === 0 && (
        <EmptyState title={professor ? `Ninguém avaliou a turma de ${professor} ainda` : 'Sem avaliações ainda'} icon="star">
          {professor ? 'Tente ver todas as turmas.' : <>Esta disciplina ainda não tem médias de dificuldade e carga. {discipline.veteranCount > 0 && <>Há {plural(discipline.veteranCount, 'veterano', 'veteranos')} no portal — <Link to={`/disciplinas/${discipline.code}?aba=perguntas`}>pergunte a eles</Link>.</>}</>}
        </EmptyState>
      )}
      {data && data.length > 0 && (
        <ul className={`review-list ${isLoading ? 'is-refreshing' : ''}`}>
          {data.map((review) => <ReviewItem key={review.id} review={review} onDelete={handleDelete} />)}
        </ul>
      )}
    </div>
  );
}
