import { useState } from 'react';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { ErrorState } from '../common/States';
import useAsync from '../../hooks/useAsync';
import { fetchDisciplines } from '../../services/api';

/**
 * Lista de disciplinas para marcar quais o aluno já cursou.
 * Cada disciplina marcada vira um selo de veterano (RF10).
 */
export default function CompletedEditor({ initial, onSave, onCancel, isSaving }) {
  const [selected, setSelected] = useState(() => new Set(initial));
  const { data, error, isLoading, reload } = useAsync(() => fetchDisciplines(), []);

  if (isLoading) return <LoadingSpinner message="Carregando a grade..." />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const groups = [
    ...[...new Set(data.filter((d) => d.type === 'obrigatoria').map((d) => d.period))].sort((a, b) => a - b)
      .map((period) => ({ key: `p${period}`, title: `${period}º período`, items: data.filter((d) => d.type === 'obrigatoria' && d.period === period) })),
    { key: 'opt', title: 'Optativas', items: data.filter((d) => d.type === 'optativa') },
  ];

  function toggle(code) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function toggleGroup(items) {
    const allSelected = items.every((d) => selected.has(d.code));
    setSelected((current) => {
      const next = new Set(current);
      items.forEach((d) => (allSelected ? next.delete(d.code) : next.add(d.code)));
      return next;
    });
  }

  return (
    <div className="completed-editor">
      <div className="completed-editor__groups">
        {groups.map((group) => (
          <fieldset key={group.key} className="completed-group">
            <legend>
              {group.title}
              {group.key !== 'opt' && (
                <button type="button" className="text-action" onClick={() => toggleGroup(group.items)}>
                  {group.items.every((d) => selected.has(d.code)) ? 'desmarcar' : 'marcar todas'}
                </button>
              )}
            </legend>
            {group.items.map((d) => (
              <label key={d.code} className={`completed-option ${selected.has(d.code) ? 'is-selected' : ''}`}>
                <input type="checkbox" checked={selected.has(d.code)} onChange={() => toggle(d.code)} />
                <span className="code-tag code-tag--sm">{d.code}</span>
                <span>{d.name}</span>
              </label>
            ))}
          </fieldset>
        ))}
      </div>
      <div className="form__actions form__actions--sticky">
        <span className="muted">{selected.size} selecionadas</span>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button onClick={() => onSave([...selected])} isLoading={isSaving}>Salvar disciplinas cursadas</Button>
      </div>
    </div>
  );
}
