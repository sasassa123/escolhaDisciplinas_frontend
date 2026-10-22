import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DisciplineRow from '../components/discipline/DisciplineRow';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Icon from '../components/common/Icon';
import { EmptyState, ErrorState } from '../components/common/States';
import useAsync from '../hooks/useAsync';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useAuth, useMeta } from '../contexts/contexts';
import { fetchDisciplines } from '../services/api';
import { plural } from '../utils/format';

const SORT_OPTIONS = [
  { value: 'period', label: 'Período da grade' },
  { value: 'name', label: 'Nome (A–Z)' },
  { value: 'difficulty', label: 'Mais fáceis primeiro' },
  { value: 'difficulty-desc', label: 'Mais difíceis primeiro' },
  { value: 'workload', label: 'Menor carga primeiro' },
  { value: 'workload-desc', label: 'Maior carga primeiro' },
  { value: 'reviews-desc', label: 'Mais avaliadas' },
];

/**
 * Listagem de disciplinas com busca por nome/código e filtros por período e
 * obrigatória/optativa (RF03). Os filtros ficam na URL para poder compartilhar.
 */
export default function Disciplines() {
  useDocumentTitle('Disciplinas');
  const [searchParams, setSearchParams] = useSearchParams();
  const { meta } = useMeta();
  const { user } = useAuth();

  const q = searchParams.get('q') || '';
  const period = searchParams.get('periodo') || '';
  const type = searchParams.get('tipo') || '';
  const sortParam = searchParams.get('ordem') || 'period';
  const [sort, order] = sortParam.endsWith('-desc') ? [sortParam.slice(0, -5), 'desc'] : [sortParam, 'asc'];

  // O texto digitado só vai para a URL após uma pequena pausa
  const [draft, setDraft] = useState(q);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (draft.trim() !== q) updateParam('q', draft.trim());
    }, 250);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const { data, error, isLoading, reload } = useAsync(
    () => fetchDisciplines({ q, period, type, sort, order }),
    [q, period, type, sort, order],
  );

  function updateParam(key, value) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    }, { replace: true });
  }

  function clearFilters() {
    setDraft('');
    setSearchParams({}, { replace: true });
  }

  const hasFilters = Boolean(q || period || type || sortParam !== 'period');
  const groupByPeriod = sort === 'period' && data;
  const completed = user?.completedDisciplines || [];

  const groups = groupByPeriod
    ? [...new Set(data.map((d) => `${d.type}-${d.period}`))].map((key) => {
      const [groupType, groupPeriod] = key.split('-');
      return {
        key,
        title: groupType === 'optativa' ? `Optativas sugeridas a partir do ${groupPeriod}º período` : `${groupPeriod}º período`,
        items: data.filter((d) => d.type === groupType && String(d.period) === groupPeriod),
      };
    }).sort((a, b) => (a.key.startsWith('optativa') - b.key.startsWith('optativa')))
    : null;

  return (
    <main className="page">
      <header className="page-header">
        <p className="kicker">Catálogo</p>
        <h1 className="page-title">Disciplinas</h1>
        <p className="lead">
          As médias vêm de avaliações de quem já cursou. Disciplinas sem avaliação aparecem marcadas — nunca com nota zero.
        </p>
      </header>

      <div className="filters" role="search">
        <label className="filters__search">
          <Icon name="search" />
          <input
            type="search"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Nome ou código (ex.: ES401)"
            aria-label="Buscar disciplina por nome ou código"
          />
        </label>

        <div className="segmented" role="group" aria-label="Tipo de disciplina">
          {[['', 'Todas'], ['obrigatoria', 'Obrigatórias'], ['optativa', 'Optativas']].map(([value, label]) => (
            <button key={value || 'all'} type="button" className={type === value ? 'is-active' : ''} aria-pressed={type === value} onClick={() => updateParam('tipo', value)}>
              {label}
            </button>
          ))}
        </div>

        <label className="select-inline">
          <span>Período</span>
          <select value={period} onChange={(event) => updateParam('periodo', event.target.value)}>
            <option value="">Todos</option>
            {(meta?.periods || [1, 2, 3, 4, 5, 6, 7]).map((p) => <option key={p} value={p}>{p}º</option>)}
          </select>
        </label>

        <label className="select-inline">
          <span>Ordenar</span>
          <select value={sortParam} onChange={(event) => updateParam('ordem', event.target.value === 'period' ? '' : event.target.value)}>
            {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>

      <div className="results-bar">
        <span aria-live="polite">{data ? plural(data.length, 'disciplina encontrada', 'disciplinas encontradas') : ' '}</span>
        {hasFilters && <button type="button" className="text-action" onClick={clearFilters}>Limpar filtros</button>}
      </div>

      {isLoading && !data && <LoadingSpinner message="Carregando disciplinas..." />}
      {error && <ErrorState error={error} onRetry={reload} />}

      {data && data.length === 0 && (
        <EmptyState title="Nenhuma disciplina encontrada" icon="search">
          Confira o código ou tente outro termo. A busca ignora acentos e maiúsculas.
        </EmptyState>
      )}

      {data && data.length > 0 && (
        <div className={isLoading ? 'is-refreshing' : ''}>
          {groups ? groups.map((group) => (
            <section key={group.key} className="discipline-group">
              <h2 className="discipline-group__title">{group.title}</h2>
              <ul className="discipline-list">
                {group.items.map((d) => <DisciplineRow key={d.code} discipline={d} completed={completed.includes(d.code)} />)}
              </ul>
            </section>
          )) : (
            <ul className="discipline-list">
              {data.map((d) => <DisciplineRow key={d.code} discipline={d} completed={completed.includes(d.code)} />)}
            </ul>
          )}
        </div>
      )}
    </main>
  );
}
