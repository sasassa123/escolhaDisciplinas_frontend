import { useState } from 'react';
import Button from '../common/Button';
import Icon from '../common/Icon';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import { EmptyState, ErrorState } from '../common/States';
import MaterialItem from './MaterialItem';
import UploadMaterialForm from './UploadMaterialForm';
import useAsync from '../../hooks/useAsync';
import useRequireAuth from '../../hooks/useRequireAuth';
import { useMeta, useToast } from '../../contexts/contexts';
import { deleteMaterial, fetchMaterials, getErrorMessage } from '../../services/api';
import { plural } from '../../utils/format';

/**
 * Repositório de materiais da disciplina com filtros por tipo, semestre e professor (RF05/US02).
 */
export default function MaterialsTab({ discipline, onCountChange }) {
  const [filters, setFilters] = useState({ type: '', semester: '', professor: '', sort: 'recent' });
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { meta, typeLabel } = useMeta();
  const toast = useToast();
  const requireAuth = useRequireAuth();

  const { data, error, isLoading, reload, setData } = useAsync(
    () => fetchMaterials(discipline.code, filters),
    [discipline.code, filters.type, filters.semester, filters.professor, filters.sort],
  );

  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const hasFilters = filters.type || filters.semester || filters.professor;

  function replaceItem(updated) {
    setData((current) => ({ ...current, items: current.items.map((m) => (m.id === updated.id ? updated : m)) }));
  }

  function openUpload() {
    if (requireAuth('para enviar materiais')) setIsUploadOpen(true);
  }

  function handleCreated(material) {
    setIsUploadOpen(false);
    setFilters({ type: '', semester: '', professor: '', sort: 'recent' });
    reload();
    onCountChange(1);
    window.setTimeout(() => document.getElementById(`material-${material.id}`)?.scrollIntoView({ block: 'center' }), 400);
  }

  async function handleDelete(material) {
    if (!window.confirm(`Excluir "${material.title}"? Essa ação não pode ser desfeita.`)) return;
    try {
      await deleteMaterial(material.id);
      setData((current) => ({ ...current, items: current.items.filter((m) => m.id !== material.id) }));
      onCountChange(-1);
      toast.success('Material excluído.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  const options = data?.filters;

  return (
    <div className="tab-panel">
      <div className="tab-toolbar">
        <div className="tab-toolbar__filters">
          <label className="select-inline">
            <span>Tipo</span>
            <select value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
              <option value="">Todos</option>
              {(meta?.materialTypes || []).map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>
          <label className="select-inline">
            <span>Semestre</span>
            <select value={filters.semester} onChange={(e) => setFilter('semester', e.target.value)}>
              <option value="">Todos</option>
              {(options?.semesters || []).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="select-inline">
            <span>Professor</span>
            <select value={filters.professor} onChange={(e) => setFilter('professor', e.target.value)}>
              <option value="">Todos</option>
              {(options?.professors || []).map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="select-inline">
            <span>Ordenar</span>
            <select value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)}>
              <option value="recent">Mais recentes</option>
              <option value="votes">Mais votados</option>
              <option value="downloads">Mais baixados</option>
            </select>
          </label>
        </div>
        <Button onClick={openUpload}><Icon name="upload" /> Enviar material</Button>
      </div>

      {isLoading && !data && <LoadingSpinner message="Carregando materiais..." />}
      {error && <ErrorState error={error} onRetry={reload} />}

      {data && data.items.length === 0 && (
        hasFilters ? (
          <EmptyState title="Nenhum material com esses filtros" icon="search"
            action={<Button variant="secondary" size="sm" onClick={() => setFilters((c) => ({ ...c, type: '', semester: '', professor: '' }))}>Limpar filtros</Button>}>
            {filters.type && `Ainda não há ${typeLabel(filters.type).toLowerCase()} `}
            {filters.semester && `de ${filters.semester} `}
            {filters.professor && `com ${filters.professor}`}.
          </EmptyState>
        ) : (
          <EmptyState title="O acervo desta disciplina ainda está vazio" icon="file" action={<Button onClick={openUpload}><Icon name="upload" /> Enviar o primeiro material</Button>}>
            Tem um resumo, uma prova antiga ou uma lista resolvida? Quem vier depois agradece.
          </EmptyState>
        )
      )}

      {data && data.items.length > 0 && (
        <>
          <p className="results-bar">{plural(data.items.length, 'material', 'materiais')}</p>
          <ul className={`material-list ${isLoading ? 'is-refreshing' : ''}`}>
            {data.items.map((m) => (
              <MaterialItem key={m.id} material={m} onChange={replaceItem} onDelete={handleDelete} />
            ))}
          </ul>
        </>
      )}

      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title={`Enviar material para ${discipline.code}`}
        description="O material aparece na disciplina assim que for publicado."
      >
        <UploadMaterialForm discipline={discipline} onCreated={handleCreated} onCancel={() => setIsUploadOpen(false)} />
      </Modal>
    </div>
  );
}
