import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/common/Button';
import Field from '../components/common/Field';
import Icon from '../components/common/Icon';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/States';
import CompletedEditor from '../components/profile/CompletedEditor';
import { ContributionHistory, ProfileHeader, ProfileStats, VeteranBadges } from '../components/profile/ProfileView';
import useAsync from '../hooks/useAsync';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useAuth, useToast } from '../contexts/contexts';
import { fetchMe, getErrorMessage, updateMe } from '../services/api';

/**
 * Perfil do próprio usuário: dados, selos de veterano e contribuições (RF10).
 */
export default function Profile() {
  useDocumentTitle('Meu perfil');
  const { setUser } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const isWelcome = searchParams.get('bemvindo') === '1';
  const { data: profile, error, isLoading, reload, setData } = useAsync(() => fetchMe(), []);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingCompleted, setIsEditingCompleted] = useState(isWelcome);
  const [info, setInfo] = useState({ name: '', period: '' });
  const [infoError, setInfoError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (error) return <main className="page"><ErrorState error={error} onRetry={reload} /></main>;
  if (isLoading || !profile) return <main className="page"><LoadingSpinner message="Carregando seu perfil..." /></main>;

  function startEditInfo() {
    setInfo({ name: profile.name, period: String(profile.period) });
    setInfoError('');
    setIsEditingInfo(true);
  }

  async function save(payload, done) {
    setIsSaving(true);
    try {
      const updated = await updateMe(payload);
      setData(updated);
      setUser(updated);
      done();
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function saveInfo(event) {
    event.preventDefault();
    if (info.name.trim().length < 3) {
      setInfoError('Informe seu nome');
      return;
    }
    const ok = await save({ name: info.name.trim(), period: Number(info.period) }, () => setIsEditingInfo(false));
    if (ok) toast.success('Perfil atualizado.');
  }

  async function saveCompleted(codes) {
    const ok = await save({ completedDisciplines: codes }, () => setIsEditingCompleted(false));
    if (ok) {
      toast.success(`Pronto! Você é veterano em ${codes.length} disciplina${codes.length === 1 ? '' : 's'}.`);
      if (isWelcome) setSearchParams({}, { replace: true });
    }
  }

  return (
    <main className="page">
      {isWelcome && (
        <div className="notice notice--welcome">
          <Icon name="star" />
          <div>
            <strong>Conta confirmada. Bem-vindo ao acervo!</strong>
            <p>Marque abaixo as disciplinas que você já cursou. Elas viram selos de veterano: você pode avaliá-las e é avisado quando alguém tiver dúvidas nelas.</p>
          </div>
        </div>
      )}

      <ProfileHeader
        profile={profile}
        actions={!isEditingInfo && <Button variant="secondary" size="sm" onClick={startEditInfo}><Icon name="edit" /> Editar dados</Button>}
      />

      {isEditingInfo && (
        <form className="panel form form--inline-panel" onSubmit={saveInfo} noValidate>
          <div className="form__row">
            <Field label="Nome" error={infoError}>
              {(props) => <input {...props} maxLength={80} value={info.name} onChange={(e) => { setInfo((c) => ({ ...c, name: e.target.value })); setInfoError(''); }} />}
            </Field>
            <Field label="Período atual">
              {(props) => (
                <select {...props} value={info.period} onChange={(e) => setInfo((c) => ({ ...c, period: e.target.value }))}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((p) => <option key={p} value={p}>{p}º período</option>)}
                </select>
              )}
            </Field>
          </div>
          <p className="field__hint">E-mail: {profile.email} (não pode ser alterado)</p>
          <div className="form__actions">
            <Button variant="ghost" onClick={() => setIsEditingInfo(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isSaving}>Salvar</Button>
          </div>
        </form>
      )}

      <ProfileStats stats={profile.contributions.stats} />

      <section className="profile-section">
        <div className="section-heading section-heading--small">
          <div>
            <h2>Selos de veterano</h2>
            <p>Disciplinas que você já cursou. Só veteranos podem avaliar uma disciplina.</p>
          </div>
          {!isEditingCompleted && (
            <Button variant="secondary" size="sm" onClick={() => setIsEditingCompleted(true)}>
              <Icon name="edit" /> Atualizar disciplinas cursadas
            </Button>
          )}
        </div>
        {isEditingCompleted ? (
          <CompletedEditor
            initial={profile.completedDisciplines}
            onSave={saveCompleted}
            onCancel={() => setIsEditingCompleted(false)}
            isSaving={isSaving}
          />
        ) : (
          <VeteranBadges veteranIn={profile.veteranIn} emptyText="Você ainda não marcou nenhuma disciplina como cursada." />
        )}
      </section>

      <ContributionHistory contributions={profile.contributions} isOwner />
    </main>
  );
}
