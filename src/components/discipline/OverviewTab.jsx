import { Link } from 'react-router-dom';
import Icon from '../common/Icon';
import { DIFFICULTY_LABELS, WORKLOAD_LABELS } from '../../utils/format';

function Distribution({ title, counts, labels }) {
  const max = Math.max(1, ...counts);
  const total = counts.reduce((sum, n) => sum + n, 0);
  return (
    <div className="distribution">
      <p className="distribution__title">{title}</p>
      {total === 0 ? (
        <p className="muted">Sem avaliações ainda.</p>
      ) : (
        <ul>
          {counts.map((count, index) => (
            <li key={labels[index + 1]} style={{ '--heat': `var(--heat-${index + 1})` }}>
              <span className="distribution__label">{index + 1} · {labels[index + 1]}</span>
              <span className="distribution__bar"><span style={{ width: `${(count / max) * 100}%` }} /></span>
              <span className="distribution__count">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Visão geral: ementa, pré-requisitos, professores e bibliografia (RF04).
 */
export default function OverviewTab({ discipline, completed }) {
  return (
    <div className="overview">
      <div className="overview__main">
        <section className="prose-block">
          <h2 className="block-title">Ementa</h2>
          <p className="syllabus">{discipline.syllabus}</p>
        </section>

        <section className="prose-block">
          <h2 className="block-title">Bibliografia</h2>
          <ol className="bibliography">
            {discipline.bibliography.map((item) => <li key={item}>{item}</li>)}
          </ol>
        </section>

        <section className="prose-block">
          <h2 className="block-title">Como a turma avaliou</h2>
          <div className="distributions">
            <Distribution title="Dificuldade" counts={discipline.distribution.difficulty} labels={DIFFICULTY_LABELS} />
            <Distribution title="Carga de trabalho" counts={discipline.distribution.workload} labels={WORKLOAD_LABELS} />
          </div>
        </section>
      </div>

      <aside className="overview__side">
        <section className="side-block">
          <h2 className="block-title">Pré-requisitos</h2>
          {discipline.prerequisites.length === 0 ? (
            <p className="muted">Nenhum. Pode cursar a qualquer momento.</p>
          ) : (
            <ul className="prereq-list">
              {discipline.prerequisites.map((p) => {
                const done = completed.includes(p.code);
                return (
                  <li key={p.code}>
                    <Link to={`/disciplinas/${p.code}`} className={`prereq ${done ? 'is-done' : ''}`}>
                      <span className="code-tag code-tag--sm">{p.code}</span>
                      <span>{p.name}</span>
                      {done && <Icon name="check" title="Você já cursou" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {discipline.unlocks.length > 0 && (
          <section className="side-block">
            <h2 className="block-title">É pré-requisito de</h2>
            <ul className="prereq-list">
              {discipline.unlocks.map((p) => (
                <li key={p.code}>
                  <Link to={`/disciplinas/${p.code}`} className="prereq">
                    <span className="code-tag code-tag--sm">{p.code}</span>
                    <span>{p.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="side-block">
          <h2 className="block-title">Professores que já ministraram</h2>
          <ul className="plain-list">
            {discipline.professors.map((name) => <li key={name}>{name}</li>)}
          </ul>
        </section>
      </aside>
    </div>
  );
}
