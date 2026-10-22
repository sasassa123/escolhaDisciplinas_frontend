import { Link, useLocation } from 'react-router-dom';
import Icon from './common/Icon';
import { useCompare, MAX_COMPARE } from '../contexts/contexts';

/**
 * Barra flutuante que aparece quando há disciplinas selecionadas para comparar.
 */
export default function CompareTray() {
  const { codes, remove, clear } = useCompare();
  const location = useLocation();

  if (codes.length === 0 || location.pathname === '/comparar') return null;

  return (
    <aside className="compare-tray" aria-label="Disciplinas selecionadas para comparar">
      <div className="compare-tray__codes">
        {codes.map((code) => (
          <span key={code} className="compare-tray__code">
            {code}
            <button type="button" onClick={() => remove(code)} aria-label={`Remover ${code} da comparação`}><Icon name="close" /></button>
          </span>
        ))}
        <span className="compare-tray__hint">{codes.length}/{MAX_COMPARE}</span>
      </div>
      <div className="compare-tray__actions">
        <button type="button" className="text-action text-action--light" onClick={clear}>Limpar</button>
        <Link to="/comparar" className="button button--marker button--sm">
          <Icon name="columns" /> Comparar {codes.length > 1 ? codes.length : ''}
        </Link>
      </div>
    </aside>
  );
}
