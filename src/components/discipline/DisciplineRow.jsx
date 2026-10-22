import { Link } from 'react-router-dom';
import ScoreMeter from '../common/ScoreMeter';
import Icon from '../common/Icon';
import CompareToggle from './CompareToggle';
import { TYPE_LABELS, plural } from '../../utils/format';

/**
 * Linha da listagem de disciplinas: mostra as médias de dificuldade e carga
 * e de quantas avaliações elas vieram (US01).
 */
export default function DisciplineRow({ discipline, completed = false }) {
  const { stats } = discipline;

  return (
    <li className="discipline-row">
      <Link to={`/disciplinas/${discipline.code}`} className="discipline-row__main">
        <span className="code-tag">{discipline.code}</span>
        <span className="discipline-row__title">
          <span className="discipline-row__name">{discipline.name}</span>
          <span className="discipline-row__meta">
            <span className={`type-pill type-pill--${discipline.type}`}>{TYPE_LABELS[discipline.type]}</span>
            <span>{discipline.period}º período{discipline.type === 'optativa' ? ' (sugerido)' : ''}</span>
            <span>{discipline.workloadHours}h</span>
            {completed && <span className="badge badge--veteran"><Icon name="star" /> Você já cursou</span>}
          </span>
        </span>
      </Link>

      <div className="discipline-row__scores">
        <ScoreMeter value={stats.avgDifficulty} kind="difficulty" compact />
        <ScoreMeter value={stats.avgWorkload} kind="workload" compact />
        <span className={`discipline-row__count ${stats.reviewCount === 0 ? 'is-empty' : ''}`}>
          {stats.reviewCount === 0 ? 'Ninguém avaliou ainda' : `com base em ${plural(stats.reviewCount, 'avaliação', 'avaliações')}`}
        </span>
      </div>

      <div className="discipline-row__side">
        <span className="discipline-row__stat" title="Materiais"><Icon name="file" /> {stats.materialCount}</span>
        <span className="discipline-row__stat" title="Perguntas"><Icon name="message" /> {stats.questionCount}</span>
        <CompareToggle code={discipline.code} />
      </div>
    </li>
  );
}
