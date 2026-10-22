import { DIFFICULTY_LABELS, WORKLOAD_LABELS, formatScore, scoreLabel } from '../../utils/format';

const KINDS = {
  difficulty: { label: 'Dificuldade', labels: DIFFICULTY_LABELS },
  workload: { label: 'Carga de trabalho', labels: WORKLOAD_LABELS },
};

/**
 * Medidor de 1 a 5 em cinco segmentos (preenchimento fracionado).
 * Sem avaliações, mostra "sem avaliações" — nunca nota zero (US01).
 * @param {Object} props
 * @param {number|null} props.value - Média de 1 a 5, ou null
 * @param {'difficulty'|'workload'} props.kind
 * @param {boolean} [props.compact] - Versão de uma linha para listas
 * @param {boolean} [props.showLabel=true] - Exibe o nome da métrica
 */
export default function ScoreMeter({ value, kind, compact = false, showLabel = true }) {
  const config = KINDS[kind];
  const hasValue = value !== null && value !== undefined;
  const heat = hasValue ? Math.min(5, Math.max(1, Math.round(value))) : 0;
  const description = hasValue
    ? `${config.label}: ${formatScore(value)} de 5 (${scoreLabel(value, config.labels).toLowerCase()})`
    : `${config.label}: sem avaliações`;

  return (
    <div className={`meter ${compact ? 'meter--compact' : ''} ${hasValue ? '' : 'meter--empty'}`} style={{ '--heat': `var(--heat-${heat})` }} role="img" aria-label={description}>
      {showLabel && <span className="meter__label">{config.label}</span>}
      <span className="meter__track" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((step) => {
          const fill = hasValue ? Math.min(1, Math.max(0, value - (step - 1))) : 0;
          return (
            <span key={step} className="meter__segment">
              <span className="meter__fill" style={{ width: `${fill * 100}%` }} />
            </span>
          );
        })}
      </span>
      {hasValue ? (
        <span className="meter__value" aria-hidden="true">
          <strong>{formatScore(value)}</strong>
          {!compact && <span className="meter__verbal">{scoreLabel(value, config.labels)}</span>}
        </span>
      ) : (
        <span className="meter__value meter__value--empty" aria-hidden="true">sem avaliações</span>
      )}
    </div>
  );
}
