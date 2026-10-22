import { useId } from 'react';

/**
 * Escolha de nota de 1 a 5 com rótulos verbais (usado no formulário de avaliação).
 * @param {Object} props
 * @param {string} props.legend - Pergunta exibida acima das opções
 * @param {string[]} props.labels - Rótulos de 1 a 5 (índice 0 ignorado)
 * @param {number} props.value
 * @param {Function} props.onChange
 */
export default function ScalePicker({ legend, hint, labels, value, onChange, error }) {
  const name = useId();
  return (
    <fieldset className={`scale ${error ? 'scale--error' : ''}`}>
      <legend className="field__label">{legend}</legend>
      {hint && <p className="field__hint">{hint}</p>}
      <div className="scale__options">
        {[1, 2, 3, 4, 5].map((option) => (
          <label key={option} className={`scale__option ${value === option ? 'is-selected' : ''}`} style={{ '--heat': `var(--heat-${option})` }}>
            <input type="radio" name={name} value={option} checked={value === option} onChange={() => onChange(option)} />
            <span className="scale__number">{option}</span>
            <span className="scale__text">{labels[option]}</span>
          </label>
        ))}
      </div>
      {error && <p className="field__error">{error}</p>}
    </fieldset>
  );
}
