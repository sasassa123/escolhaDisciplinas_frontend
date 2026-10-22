import { Navigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/States';
import { ContributionHistory, ProfileHeader, ProfileStats, VeteranBadges } from '../components/profile/ProfileView';
import useAsync from '../hooks/useAsync';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useAuth } from '../contexts/contexts';
import { fetchUser } from '../services/api';
import NotFound from './NotFound';

/**
 * Perfil público de um aluno: curso, período, selos e contribuições (RF10).
 */
export default function UserProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: profile, error, isLoading, reload } = useAsync(() => fetchUser(id), [id]);
  useDocumentTitle(profile?.name || 'Perfil');

  if (user && String(user.id) === id) return <Navigate to="/perfil" replace />;
  if (error?.response?.status === 404) return <NotFound message="Esse perfil não existe." />;
  if (error) return <main className="page"><ErrorState error={error} onRetry={reload} /></main>;
  if (isLoading) return <main className="page"><LoadingSpinner message="Carregando perfil..." /></main>;

  return (
    <main className="page">
      <ProfileHeader profile={profile} />
      <ProfileStats stats={profile.contributions.stats} />
      <section className="profile-section">
        <div className="section-heading section-heading--small">
          <h2>Selos de veterano</h2>
        </div>
        <VeteranBadges veteranIn={profile.veteranIn} emptyText={`${profile.name.split(' ')[0]} ainda não marcou disciplinas cursadas.`} />
      </section>
      <ContributionHistory contributions={profile.contributions} />
    </main>
  );
}
