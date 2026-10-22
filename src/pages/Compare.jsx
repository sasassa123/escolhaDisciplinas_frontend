import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Icon from '../components/common/Icon';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ScoreMeter from '../components/common/ScoreMeter';
import { EmptyState, ErrorState } from '../components/common/States';
import useAsync from '../hooks/useAsync';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useAuth, useCompare, MAX_COMPARE } from '../contexts/contexts';
import { fetchDiscipline } from '../services/api';
import { TYPE_LABELS, formatScore, plural } from '../utils/format';

const HEAVY = 4;

/** Lê a combinação escolhida e devolve avisos práticos para montar a grade. */
function analyse(disciplines, completed, isLogged) {
  const rated = disciplines.filter((d) => d.stats.reviewCount > 0);
  const heavy = rated.filter((d) => d.stats.avgWorkload >= HEAVY || d.stats.avgDifficulty >= HEAVY + 0.5);
  const unrated = disciplines.filter((d) => d.stats.reviewCount === 0);
  const totalHours = disciplines.reduce((sum, d) => sum + d.workloadHours, 0);
  const workloadSum = rated.reduce((sum, d) => sum + d.stats.avgWorkload, 0);

  let tone = 'ok';
  let headline = 'Combinação equilibrada';
  let text = 'Nenhuma das disciplinas escolhidas tem carga média alta segundo quem cursou.';
  if (heavy.length >= 2) {
    tone = 'danger';
    headline = 'Combinação pesada';
    text = `${heavy.map((d) => d.code).join(' e ')} têm carga ou dificuldade alta. Juntas, costumam ocupar o semestre inteiro — se trabalha ou faz estágio, considere separar.`;
  } else if (heavy.length === 1) {
    tone = 'warning';
    headline = 'Uma disciplina puxada';
    text = `${heavy[0].code} pesa mais que as outras. Dá para equilibrar com disciplinas mais leves.`;
  }

  const notes = [];
  if (unrated.length) {
    notes.push(`${unrated.map((d) => d.code).join(', ')} ainda não ${unrated.length > 1 ? 'têm' : 'tem'} avaliações — a comparação fica incompleta.`);
  }
  if (isLogged) {
    disciplines.forEach((d) => {
      const missing = d.prerequisites.filter((p) => !completed.includes(p.code));
      if (missing.length && !completed.includes(d.code)) {
        notes.push(`Para ${d.code}, ainda falta${missing.length > 1 ? 'm' : ''} ${missing.map((p) => p.code).join(', ')}.`);
      }
    });
  }

  return { tone, headline, text, notes, totalHours, workloadSum, ratedCount: rated.length };
}

/**
 * Comparação lado a lado de até quatro disciplinas (US01).
 */
export default function Compare() {
  useDocumentTitle('Comparar disciplinas');
  const { codes, remove, clear } = useCompare();
  const { user } = useAuth();
  const completed = user?.completedDisciplines || [];

  const { data, error, isLoading, reload } = useAsync(async () => {
    const results = await Promise.allSettled(codes.map((code) => fetchDiscipline(code)));
    const failed = results.find((r) => r.status === 'rejected' && r.reason?.response?.status !== 404);
    if (failed) throw failed.reason;
    return results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  }, [codes.join(','), user?.id]);

  const header = (
    <header className="page-header">
      <p className="kicker">Montar a grade</p>
      <h1 className="page-title">Comparar disciplinas</h1>
      <p className="lead">Escolha até {MAX_COMPARE} disciplinas na <Link to="/disciplinas">listagem</Link> para ver dificuldade, carga e pré-requisitos lado a lado.</p>
    </header>
  );

  if (codes.length === 0) {
    return (
      <main className="page">
        {header}
        <EmptyState title="Nenhuma disciplina selecionada" icon="columns" action={<Button to="/disciplinas?tipo=optativa">Ver optativas</Button>}>
          Use o botão “Comparar” ao lado de cada disciplina. A seleção fica salva neste navegador.
        </EmptyState>
      </main>
    );
  }

  return (
    <main className="page">
      {header}
      {isLoading && !data && <LoadingSpinner message="Buscando as disciplinas..." />}
      {error && <ErrorState error={error} onRetry={reload} />}

      {data && (() => {
        const analysis = analyse(data, completed, Boolean(user));
        return (
          <>
            <section className={`verdict verdict--${analysis.tone}`} aria-live="polite">
              <div className="verdict__main">
                <p className="verdict__headline">{data.length > 1 ? analysis.headline : 'Adicione mais uma para comparar'}</p>
                {data.length > 1 && <p>{analysis.text}</p>}
                {analysis.notes.length > 0 && (
                  <ul className="verdict__notes">
                    {analysis.notes.map((note) => <li key={note}><Icon name="alert" /> {note}</li>)}
                  </ul>
                )}
              </div>
              <dl className="verdict__numbers">
                <div><dt>Carga horária somada</dt><dd>{analysis.totalHours}h</dd></div>
                <div>
                  <dt>Carga de trabalho somada</dt>
                  <dd>{analysis.ratedCount ? `${formatScore(analysis.workloadSum)}` : '—'}<small>{analysis.ratedCount ? ` de ${analysis.ratedCount * 5}` : ''}</small></dd>
                </div>
              </dl>
            </section>

            <div className="compare-actions">
              <span className="muted">{plural(data.length, 'disciplina', 'disciplinas')} de {MAX_COMPARE}</span>
              <span>
                {data.length < MAX_COMPARE && <Button to="/disciplinas" variant="secondary" size="sm"><Icon name="plus" /> Adicionar</Button>}
                <button type="button" className="text-action text-action--muted" onClick={clear}>Limpar tudo</button>
              </span>
            </div>

            <div className="compare-scroll">
              <table className="compare-table" style={{ '--cols': data.length }}>
                <thead>
                  <tr>
                    <th scope="col" className="compare-table__corner"><span className="visually-hidden">Critério</span></th>
                    {data.map((d) => (
                      <th key={d.code} scope="col">
                        <div className="compare-table__head">
                          <span className="code-tag code-tag--sm">{d.code}</span>
                          <button type="button" className="icon-button icon-button--sm" onClick={() => remove(d.code)} aria-label={`Remover ${d.code}`}><Icon name="close" /></button>
                        </div>
                        <Link to={`/disciplinas/${d.code}`} className="compare-table__name">{d.name}</Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Dificuldade</th>
                    {data.map((d) => <td key={d.code}><ScoreMeter value={d.stats.avgDifficulty} kind="difficulty" showLabel={false} /></td>)}
                  </tr>
                  <tr>
                    <th scope="row">Carga de trabalho</th>
                    {data.map((d) => <td key={d.code}><ScoreMeter value={d.stats.avgWorkload} kind="workload" showLabel={false} /></td>)}
                  </tr>
                  <tr>
                    <th scope="row">Baseado em</th>
                    {data.map((d) => <td key={d.code} className={d.stats.reviewCount ? '' : 'muted'}>{d.stats.reviewCount ? plural(d.stats.reviewCount, 'avaliação', 'avaliações') : 'sem avaliações'}</td>)}
                  </tr>
                  <tr>
                    <th scope="row">Tipo</th>
                    {data.map((d) => <td key={d.code}><span className={`type-pill type-pill--${d.type}`}>{TYPE_LABELS[d.type]}</span> · {d.period}º período</td>)}
                  </tr>
                  <tr>
                    <th scope="row">Carga horária</th>
                    {data.map((d) => <td key={d.code}>{d.workloadHours}h · {d.credits} créditos</td>)}
                  </tr>
                  <tr>
                    <th scope="row">Pré-requisitos</th>
                    {data.map((d) => (
                      <td key={d.code}>
                        {d.prerequisites.length === 0 ? <span className="muted">Nenhum</span> : (
                          <ul className="compare-prereqs">
                            {d.prerequisites.map((p) => (
                              <li key={p.code} className={user ? (completed.includes(p.code) ? 'is-done' : 'is-missing') : ''}>
                                {user && <Icon name={completed.includes(p.code) ? 'check' : 'close'} />}
                                <Link to={`/disciplinas/${p.code}`}>{p.code}</Link> <span>{p.name}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Professores</th>
                    {data.map((d) => <td key={d.code}>{d.professors.join(', ')}</td>)}
                  </tr>
                  <tr>
                    <th scope="row">No acervo</th>
                    {data.map((d) => (
                      <td key={d.code}>
                        <Link to={`/disciplinas/${d.code}?aba=materiais`}>{plural(d.stats.materialCount, 'material', 'materiais')}</Link>
                        {' · '}
                        <Link to={`/disciplinas/${d.code}?aba=perguntas`}>{plural(d.stats.questionCount, 'pergunta')}</Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        );
      })()}
    </main>
  );
}
