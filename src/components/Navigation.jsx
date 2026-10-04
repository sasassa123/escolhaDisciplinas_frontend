import { NavLink } from 'react-router-dom';

const navigationLinks = [
  { path: '/', label: 'Home' },
  { path: '/products', label: 'Produtos' },
  { path: '/about', label: 'Sobre' },
  { path: '/contact', label: 'Contato' },
];

/**
 * Menu principal com os links para as páginas da aplicação.
 * Usa NavLink para trocar de página sem recarregar e marcar o link ativo.
 */
export default function Navigation() {
  return (
    <nav className="navigation">
      {navigationLinks.map((link) => (
        <NavLink key={link.path} to={link.path} end={link.path === '/'}>
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}