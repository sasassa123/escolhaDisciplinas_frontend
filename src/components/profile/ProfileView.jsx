import { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';
import Icon from '../common/Icon';
import { EmptyState } from '../common/States';
import { formatDate, plural, timeAgo } from '../../utils/format';

const KIND_LABELS = {
  material: { label: 'Material', icon: 'file', plural: 'Materiais' },
  answer: { label: 'Resposta', icon: 'message', plural: 'Respostas' },
  question: { label: 'Pergunta', icon: 'message', plural: 'Perguntas' },
  review: { label: 'Avaliação', icon: 'star', plural: 'Avaliações' },
};

export function ProfileHeader({ profile, actions }) {
  return (
    <header className="profile-header">
      <Avatar user={profile} size="xl" />
      <div className="profile-header__info">
        <h1 className="page-title">{profile.name}</h1>
        <p className="profile-header__meta">
          {profile.course} · {profile.period}º período · no acervo desde {formatDate(profile.createdAt)}
        </p>
        <p className="profile-header__badges">
          {profile.role === 'moderator' && <span className="badge badge--mod"><Icon name="shield" /> Moderação</span>}
          {profile.veteranIn.length > 0 && <span className="badge badge--veteran"><Icon name="star" /> Veterano em {plural(profile.veteranIn.length, 'disciplina')}</span>}
        </p>
      </div>
      {actions && <div className="profile-header__actions">{actions}</div>}
    </header>
  );
}

export function ProfileStats({ stats }) {
  const items = [
    ['Materiais enviados', stats.materials],
    ['Downloads dos seus materiais', stats.downloads],
    ['Respostas', stats.answers],
    ['Melhores respostas', stats.bestAnswers],
    ['Perguntas', stats.questions],
    ['Avaliações', stats.reviews],
  ];
  return (
    <dl className="profile-stats">
      {items.map(([label, value]) => (
        <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
      ))}
    </dl>
  );
}

export function VeteranBadges({ veteranIn, emptyText }) {
  if (veteranIn.length === 0) return <p className="muted">{emptyText}</p>;
  return (
    <ul className="veteran-badges">
      {veteranIn.map((d) => (
        <li key={d.code}>
          <Link to={`/disciplinas/${d.code}`} className={`veteran-badge veteran-badge--${d.type}`} title={d.name}>
            <Icon name="star" />
            <span className="veteran-badge__code">{d.code}</span>
            <span className="veteran-badge__name">{d.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Histórico de contribuições (US04), com filtro por tipo.
 */
export function ContributionHistory({ contributions, isOwner }) {
  const [filter, setFilter] = useState('');
  const items = contributions.items.filter((item) => !filter || item.kind === filter);
  const counts = contributions.items.reduce((acc, item) => ({ ...acc, [item.kind]: (acc[item.kind] || 0) + 1 }), {});

  return (
    <section className="profile-section">
      <div className="section-heading section-heading--small">
        <h2>Contribuições</h2>
      </div>
      <div className="segmented segmented--wrap" role="group" aria-label="Filtrar contribuições">
        <button type="button" className={!filter ? 'is-active' : ''} aria-pressed={!filter} onClick={() => setFilter('')}>Tudo <span>{contributions.items.length}</span></button>
        {Object.entries(KIND_LABELS).map(([kind, config]) => (
          <button key={kind} type="button" className={filter === kind ? 'is-active' : ''} aria-pressed={filter === kind} onClick={() => setFilter(kind)} disabled={!counts[kind]}>
            {config.plural} <span>{counts[kind] || 0}</span>
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState title={isOwner ? 'Você ainda não contribuiu' : 'Nenhuma contribuição ainda'} icon="book">
          {isOwner && 'Envie um resumo, avalie uma disciplina que já cursou ou responda uma dúvida — tudo aparece aqui.'}
        </EmptyState>
      ) : (
        <ol className="timeline">
          {items.map((item) => (
            <li key={`${item.kind}-${item.id}`} className={`timeline__item ${item.status === 'removed' ? 'is-removed' : ''}`}>
              <span className="timeline__icon"><Icon name={KIND_LABELS[item.kind].icon} /></span>
              <div className="timeline__body">
                <p className="timeline__meta">
                  {KIND_LABELS[item.kind].label} em <span className="code-tag code-tag--sm">{item.disciplineCode}</span> · {timeAgo(item.createdAt)}
                  {item.status === 'removed' && <span className="badge badge--removed">Removido pela moderação</span>}
                </p>
                {item.link && item.status !== 'removed'
                  ? <Link to={item.link} className="timeline__title">{item.title}</Link>
                  : <span className="timeline__title">{item.title}</span>}
                {(item.detail || typeof item.score === 'number') && (
                  <p className="timeline__detail">
                    {typeof item.score === 'number' && <span className="timeline__score"><Icon name="up" /> {item.score}</span>}
                    {item.detail && <span>{item.detail}</span>}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
