import { Link } from 'react-router-dom';
import SearchBox from '../components/SearchBox';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Icon from '../components/common/Icon';
import { ErrorState } from '../components/common/States';
import useAsync from '../hooks/useAsync';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useAuth, useMeta } from '../contexts/contexts';
import { fetchActivity, fetchDisciplines } from '../services/api';
import { formatScore, plural, timeAgo } from '../utils/format';

function heatOf(value) {
  return value === null ? 0 : Math.min(5, Math.max(1, Math.round(value)));
}

/**
 * Mapa da grade: um "quadro" por período com as disciplinas coloridas pela
 * dificuldade média. As optativas ficam numa faixa separada.
 */
function CurriculumMap({ disciplines, completed }) {
  const periods = [...new Set(disciplines.filter((d) => d.type === 'obrigatoria').map((d) => d.period))].sort((a, b) => a - b);
  const electives = disciplines.filter((d) => d.type === 'optativa');

  const tile = (d) => (
    <Link
      key={d.code}
      to={`/disciplinas/${d.code}`}
      className={`map-tile ${completed.includes(d.code) ? 'is-done' : ''}`}
      style={{ '--heat': `var(--heat-${heatOf(d.stats.avgDifficulty)})` }}
      title={d.stats.reviewCount ? `Dificuldade ${formatScore(d.stats.avgDifficulty)} · ${plural(d.stats.reviewCount, 'avaliação', 'avaliações')}` : 'Sem avaliações'}
    >
      <span className="map-tile__code">{d.code}</span>
      <span className="map-tile__name">{d.name}</span>
      <span className="map-tile__score">{d.stats.reviewCount ? formatScore(d.stats.avgDifficulty) : '—'}</span>
    </Link>
  );

  return (
    <div className="curriculum">
      <div className="curriculum__grid">
        {periods.map((period) => (
          <div key={period} className="curriculum__column">
            <p className="curriculum__period"><span>{period}º</span> período</p>
            {disciplines.filter((d) => d.type === 'obrigatoria' && d.period === period).map(tile)}
          </div>
        ))}
      </div>
      <div className="curriculum__electives">
        <p className="curriculum__period"><span>Optativas</span> {electives.length} ofertadas</p>
        <div className="curriculum__elective-list">{electives.map(tile)}</div>
      </div>
      <div className="curriculum__legend" aria-hidden="true">
        <span>Dificuldade média:</span>
        {[1, 2, 3, 4, 5].map((n) => <span key={n} className="legend-swatch" style={{ '--heat': `var(--heat-${n})` }}>{n}</span>)}
        <span className="legend-swatch legend-swatch--empty">—</span>
        <span>sem avaliações</span>
        {completed.length > 0 && <span className="legend-done">✓ já cursada</span>}
      </div>
    </div>
  );
}

export default function Home() {
  useDocumentTitle('');
  const { meta } = useMeta();
  const { user } = useAuth();
  const disciplines = useAsync(() => fetchDisciplines(), []);
  const activity = useAsync(() => fetchActivity(), []);

  return (
    <main className="home">
      <section className="hero">
        <p className="kicker">{meta ? `${meta.course} · ${meta.institution}` : 'Portal de Disciplinas'}</p>
        <h1 className="hero__title">
          O que a ementa não conta, <em>quem já cursou</em> conta.
        </h1>
        <p className="hero__lead">
          Provas antigas, resumos, avaliações de dificuldade e as dúvidas que todo semestre se repetem — guardados
          na página de cada disciplina, em vez de sumirem no grupo da turma.
        </p>
        <SearchBox size="lg" placeholder="Ex.: Cálculo, ES401, “quanto tempo por semana”…" />
        {meta && (
          <p className="hero__stats">
            <span><strong>{meta.totals.disciplines}</strong> disciplinas</span>
            <span><strong>{meta.totals.reviews}</strong> avaliações</span>
            <span><strong>{meta.totals.materials}</strong> materiais</span>
            <span><strong>{meta.totals.answers}</strong> respostas de veteranos</span>
          </p>
        )}
      </section>

      <section className="home-section">
        <div className="section-heading">
          <div>
            <h2>A grade, do jeito que ela é</h2>
            <p>Cada disciplina pintada pela dificuldade média segundo quem cursou. Clique para abrir a página dela.</p>
          </div>
          <Link to="/disciplinas" className="text-action">Ver lista completa <Icon name="chevron" /></Link>
        </div>
        {disciplines.isLoading && <LoadingSpinner message="Montando a grade..." />}
        {disciplines.error && <ErrorState error={disciplines.error} onRetry={disciplines.reload} />}
        {disciplines.data && <CurriculumMap disciplines={disciplines.data} completed={user?.completedDisciplines || []} />}
      </section>

      <section className="home-section home-columns">
        <div className="home-column">
          <div className="section-heading section-heading--small">
            <h2>Esperando um veterano</h2>
            <p>Perguntas ainda sem resposta. Já cursou? Ajuda aí.</p>
          </div>
          {activity.isLoading && <LoadingSpinner inline />}
          {activity.error && <ErrorState error={activity.error} onRetry={activity.reload} />}
          {activity.data && (
            activity.data.unanswered.length === 0 ? (
              <p className="muted">Todas as perguntas já têm resposta. 🎉</p>
            ) : (
              <ul className="feed">
                {activity.data.unanswered.map((q) => (
                  <li key={q.id}>
                    <Link to={`/perguntas/${q.id}`} className="feed-item">
                      <span className="code-tag code-tag--sm">{q.disciplineCode}</span>
                      <span className="feed-item__title">{q.title}</span>
                      <span className="feed-item__meta">{q.author.name} · {timeAgo(q.createdAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>

        <div className="home-column">
          <div className="section-heading section-heading--small">
            <h2>Chegou no acervo</h2>
            <p>Materiais enviados recentemente pela comunidade.</p>
          </div>
          {activity.data && (
            <ul className="feed">
              {activity.data.materials.map((m) => (
                <li key={m.id}>
                  <Link to={`/disciplinas/${m.disciplineCode}?aba=materiais`} className="feed-item">
                    <span className="code-tag code-tag--sm">{m.disciplineCode}</span>
                    <span className="feed-item__title">{m.title}</span>
                    <span className="feed-item__meta">
                      {m.author.name} · {timeAgo(m.createdAt)} · <Icon name="up" /> {m.upvotes}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="home-section callout-band">
        <div>
          <h2>Montando a grade do próximo semestre?</h2>
          <p>
            Marque até quatro disciplinas e compare dificuldade, carga de trabalho e pré-requisitos lado a lado.
            O portal avisa quando a combinação fica pesada demais.
          </p>
        </div>
        <Link to="/disciplinas?tipo=optativa" className="button button--marker">Escolher optativas</Link>
      </section>
    </main>
  );
}
