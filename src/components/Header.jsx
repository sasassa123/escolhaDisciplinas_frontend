import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import SearchBox from './SearchBox';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';
import Icon from './common/Icon';
import { useAuth } from '../contexts/contexts';

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Acervo — página inicial">
      <svg className="logo__mark" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="3" y="5" width="20" height="24" rx="2" fill="var(--accent)" />
        <rect x="9" y="3" width="20" height="24" rx="2" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.6" />
        <path d="M13 10h12M13 14h12M13 18h7" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="24" cy="21.5" r="3.2" fill="var(--marker)" stroke="var(--ink)" strokeWidth="1.4" />
      </svg>
      <span className="logo__word">acervo</span>
    </Link>
  );
}

/**
 * Cabeçalho no topo de todas as páginas.
 */
export default function Header() {
  const { user, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const searchKey = location.pathname === '/busca' ? location.search : 'header';
  const currentQuery = location.pathname === '/busca' ? new URLSearchParams(location.search).get('q') || '' : '';

  return (
    <header className="header">
      <div className="header__inner">
        <Logo />

        <button
          type="button"
          className="icon-button icon-button--header header__menu-toggle"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls="header-menu"
          aria-label="Abrir menu"
        >
          <Icon name={isMenuOpen ? 'close' : 'menu'} />
        </button>

        <div id="header-menu" className={`header__menu ${isMenuOpen ? 'is-open' : ''}`} onSubmit={() => setIsMenuOpen(false)}>
          <Navigation onNavigate={() => setIsMenuOpen(false)} />
          {!isHome && <div className="header__search"><SearchBox key={searchKey} initialValue={currentQuery} size="sm" placeholder="Buscar…" /></div>}
        </div>

        <div className="header__account">
          {isLoading && <span className="header__placeholder" aria-hidden="true" />}
          {!isLoading && user && (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          )}
          {!isLoading && !user && (
            <>
              <Link to={`/entrar?next=${encodeURIComponent(location.pathname + location.search)}`} className="header__link">Entrar</Link>
              <Link to="/cadastro" className="button button--primary button--sm">Criar conta</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
