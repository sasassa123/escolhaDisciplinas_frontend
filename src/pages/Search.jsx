import { Link, useSearchParams } from 'react-router-dom';
import SearchBox from '../components/SearchBox';
import DisciplineRow from '../components/discipline/DisciplineRow';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Icon from '../components/common/Icon';
import { EmptyState, ErrorState } from '../components/common/States';
import useAsync from '../hooks/useAsync';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useAuth } from '../contexts/contexts';
import { searchAll } from '../services/api';
import { plural, timeAgo } from '../utils/format';

/** Destaca os termos buscados dentro de um texto. */
function Highlight({ text, query }) {
  const terms = query.trim().split(/\s+/).filter((t) => t.length > 1)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!terms.length) return text;
  const regex = new RegExp(`(${terms.join('|')})`, 'gi');
  return String(text).split(regex).map((part, index) => (
    index % 2 === 1 ? <mark key={index}>{part}</mark> : part
  ));
}

function excerpt(text, max = 220) {
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

/**
 * Busca geral: disciplinas, perguntas e o texto das respostas (RF06).
 */
export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const { user } = useAuth();
  useDocumentTitle(q ? `Busca: ${q}` : 'Busca');
  const { data, error, isLoading, reload } = useAsync(() => searchAll(q), [q]);
  const completed = user?.completedDisciplines || [];

  const total = data ? data.disciplines.length + data.questions.length : 0;

  return (
    <main className="page">
      <header className="page-header">
        <p className="kicker">Busca</p>
        <h1 className="page-title">{q ? <>Resultados para “{q}”</> : 'O que você procura?'}</h1>
        <div className="search-page__box"><SearchBox key={q} initialValue={q} size="lg" /></div>
      </header>

      {q.length > 0 && q.length < 2 && <p className="muted">Digite pelo menos 2 letras.</p>}
      {isLoading && q.length >= 2 && <LoadingSpinner message="Procurando no acervo..." />}
      {error && <ErrorState error={error} onRetry={reload} />}

      {data && q.length >= 2 && total === 0 && (
        <EmptyState title="Nada encontrado" icon="search">
          Tente o código da disciplina (ex.: ES201), uma palavra mais curta ou sem acento. Não achou sua dúvida? Abra a disciplina e pergunte.
        </EmptyState>
      )}

      {data && data.disciplines.length > 0 && (
        <section className="search-section">
          <h2 className="search-section__title">{plural(data.disciplines.length, 'disciplina', 'disciplinas')}</h2>
          <ul className="discipline-list">
            {data.disciplines.map((d) => <DisciplineRow key={d.code} discipline={d} completed={completed.includes(d.code)} />)}
          </ul>
        </section>
      )}

      {data && data.questions.length > 0 && (
        <section className="search-section">
          <h2 className="search-section__title">{plural(data.questions.length, 'pergunta', 'perguntas')} e respostas</h2>
          <ul className="search-results">
            {data.questions.map((item) => (
              <li key={item.id}>
                <Link to={`/perguntas/${item.id}${item.matchedAnswer ? `#resposta-${item.matchedAnswer.id}` : ''}`} className="search-result">
                  <span className="search-result__meta">
                    <span className="code-tag code-tag--sm">{item.disciplineCode}</span>
                    {item.disciplineName} · {plural(item.answerCount, 'resposta')} · {timeAgo(item.createdAt)}
                    {item.hasBestAnswer && <span className="badge badge--solved"><Icon name="check" /> Resolvida</span>}
                  </span>
                  <span className="search-result__title"><Highlight text={item.title} query={q} /></span>
                  {item.matchedAnswer ? (
                    <span className="search-result__answer">
                      <strong>{item.matchedAnswer.author.name}{item.matchedAnswer.author.isVeteran ? ' (veterano)' : ''} respondeu:</strong>{' '}
                      <Highlight text={excerpt(item.matchedAnswer.body)} query={q} />
                    </span>
                  ) : (
                    <span className="search-result__excerpt"><Highlight text={excerpt(item.body)} query={q} /></span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
