import { NavLink } from 'react-router-dom';
import { useAuth, useCompare } from '../contexts/contexts';

/**
 * Menu principal com os links para as páginas da aplicação.
 * Usa NavLink para trocar de página sem recarregar e marcar o link ativo.
 */
export default function Navigation({ onNavigate }) {
  const { isModerator } = useAuth();
  const { codes } = useCompare();

  const navigationLinks = [
    { path: '/disciplinas', label: 'Disciplinas' },
    { path: '/comparar', label: 'Comparar', count: codes.length },
    { path: '/sobre', label: 'Como funciona' },
    ...(isModerator ? [{ path: '/moderacao', label: 'Moderação' }] : []),
  ];

  return (
    <nav className="navigation" aria-label="Principal">
      {navigationLinks.map((link) => (
        <NavLink key={link.path} to={link.path} onClick={onNavigate}>
          {link.label}
          {link.count > 0 && <span className="navigation__count">{link.count}</span>}
        </NavLink>
      ))}
    </nav>
  );
}
