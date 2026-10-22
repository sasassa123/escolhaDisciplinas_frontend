import { Link, useParams, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ScoreMeter from '../components/common/ScoreMeter';
import Icon from '../components/common/Icon';
import { ErrorState } from '../components/common/States';
import CompareToggle from '../components/discipline/CompareToggle';
import OverviewTab from '../components/discipline/OverviewTab';
import MaterialsTab from '../components/discipline/MaterialsTab';
import ReviewsTab from '../components/discipline/ReviewsTab';
import QuestionsTab from '../components/discipline/QuestionsTab';
import useAsync from '../hooks/useAsync';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useAuth } from '../contexts/contexts';
import { fetchDiscipline } from '../services/api';
import { TYPE_LABELS, plural } from '../utils/format';
import NotFound from './NotFound';

const TABS = [
  { id: 'visao-geral', label: 'Visão geral' },
  { id: 'materiais', label: 'Materiais', stat: 'materialCount' },
  { id: 'avaliacoes', label: 'Avaliações', stat: 'reviewCount' },
  { id: 'perguntas', label: 'Perguntas', stat: 'questionCount' },
];

/**
 * Página individual da disciplina (RF04): tudo sobre ela num só lugar.
 */
export default function DisciplineDetail() {
  const { code } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { data: discipline, error, isLoading, reload, setData } = useAsync(() => fetchDiscipline(code), [code, user?.id]);
  useDocumentTitle(discipline ? `${discipline.code} ${discipline.name}` : code);

  const activeTab = TABS.some((t) => t.id === searchParams.get('aba')) ? searchParams.get('aba') : 'visao-geral';

  function selectTab(id) {
    setSearchParams(id === 'visao-geral' ? {} : { aba: id }, { replace: true });
  }

  function handleTabKeys(event) {
    const index = TABS.findIndex((t) => t.id === activeTab);
    let next = null;
    if (event.key === 'ArrowRight') next = TABS[(index + 1) % TABS.length];
    if (event.key === 'ArrowLeft') next = TABS[(index - 1 + TABS.length) % TABS.length];
    if (next) {
      event.preventDefault();
      selectTab(next.id);
      document.getElementById(`tab-${next.id}`)?.focus();
    }
  }

  if (error?.response?.status === 404) return <NotFound message={`Não existe disciplina com o código ${code}.`} />;
  if (error) return <main className="page"><ErrorState error={error} onRetry={reload} /></main>;
  if (isLoading && !discipline) return <main className="page"><LoadingSpinner message="Abrindo a disciplina..." /></main>;

  const { stats } = discipline;
  const completed = user?.completedDisciplines || [];
  const missingPrereqs = user ? discipline.prerequisites.filter((p) => !completed.includes(p.code)) : [];

  return (
    <main className="page discipline-page">
      <nav className="breadcrumb" aria-label="Você está em">
        <Link to="/disciplinas">Disciplinas</Link>
        <Icon name="chevron" />
        <span>{discipline.code}</span>
      </nav>

      <header className="discipline-hero">
        <div className="discipline-hero__heading">
          <span className="code-tag code-tag--lg">{discipline.code}</span>
          <h1 className="discipline-hero__title">{discipline.name}</h1>
          <p className="discipline-hero__facts">
            <span className={`type-pill type-pill--${discipline.type}`}>{TYPE_LABELS[discipline.type]}</span>
            <span>{discipline.period}º período{discipline.type === 'optativa' ? ' sugerido' : ''}</span>
            <span>{discipline.workloadHours} horas · {discipline.credits} créditos</span>
            {discipline.viewer?.isVeteran && <span className="badge badge--veteran"><Icon name="star" /> Você é veterano aqui</span>}
          </p>
        </div>
        <CompareToggle code={discipline.code} variant="button" />
      </header>

      {missingPrereqs.length > 0 && !discipline.viewer?.isVeteran && (
        <p className="notice notice--warning">
          <Icon name="alert" />
          <span>
            Pelo seu perfil, ainda falta{missingPrereqs.length > 1 ? 'm' : ''} {missingPrereqs.map((p) => p.code).join(', ')} para cursar esta disciplina.
            {' '}<Link to="/perfil">Atualizar disciplinas cursadas</Link>
          </span>
        </p>
      )}

      <section className="stat-strip" aria-label="Resumo das avaliações">
        <div className="stat-strip__meters">
          <ScoreMeter value={stats.avgDifficulty} kind="difficulty" />
          <ScoreMeter value={stats.avgWorkload} kind="workload" />
        </div>
        <dl className="stat-strip__numbers">
          <div><dt>Avaliações</dt><dd>{stats.reviewCount || '—'}</dd></div>
          <div><dt>Materiais</dt><dd>{stats.materialCount}</dd></div>
          <div><dt>Perguntas</dt><dd>{stats.questionCount}</dd></div>
          <div><dt>Veteranos</dt><dd>{discipline.veteranCount}</dd></div>
        </dl>
        {stats.reviewCount === 0 && (
          <p className="stat-strip__note">Ainda sem avaliações — as médias aparecem assim que alguém que cursou avaliar.</p>
        )}
        {stats.reviewCount > 0 && (
          <p className="stat-strip__note">Médias de {plural(stats.reviewCount, 'avaliação', 'avaliações')} de quem já cursou.</p>
        )}
      </section>

      <div className="tabs" role="tablist" aria-label="Seções da disciplina" onKeyDown={handleTabKeys}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={`tabs__tab ${activeTab === tab.id ? 'is-active' : ''}`}
            onClick={() => selectTab(tab.id)}
          >
            {tab.label}
            {tab.stat && <span className="tabs__count">{stats[tab.stat]}</span>}
          </button>
        ))}
      </div>

      <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
        {activeTab === 'visao-geral' && <OverviewTab discipline={discipline} completed={completed} />}
        {activeTab === 'materiais' && (
          <MaterialsTab
            discipline={discipline}
            onCountChange={(delta) => setData((d) => ({ ...d, stats: { ...d.stats, materialCount: d.stats.materialCount + delta } }))}
          />
        )}
        {activeTab === 'avaliacoes' && <ReviewsTab discipline={discipline} onChanged={reload} />}
        {activeTab === 'perguntas' && <QuestionsTab discipline={discipline} />}
      </div>
    </main>
  );
}
