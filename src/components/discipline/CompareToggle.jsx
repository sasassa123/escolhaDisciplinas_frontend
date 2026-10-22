import Icon from '../common/Icon';
import { useCompare, useToast, MAX_COMPARE } from '../../contexts/contexts';

/**
 * Adiciona/remove a disciplina da comparação lado a lado.
 */
export default function CompareToggle({ code, variant = 'chip' }) {
  const { has, toggle, isFull } = useCompare();
  const toast = useToast();
  const selected = has(code);

  function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!selected && isFull) {
      toast.info(`Você pode comparar até ${MAX_COMPARE} disciplinas por vez.`);
      return;
    }
    toggle(code);
  }

  return (
    <button
      type="button"
      className={`compare-toggle compare-toggle--${variant} ${selected ? 'is-selected' : ''}`}
      onClick={handleClick}
      aria-pressed={selected}
      title={selected ? 'Remover da comparação' : 'Adicionar à comparação'}
    >
      <span className="compare-toggle__box" aria-hidden="true">{selected && <Icon name="check" />}</span>
      {selected ? 'Comparando' : 'Comparar'}
    </button>
  );
}
