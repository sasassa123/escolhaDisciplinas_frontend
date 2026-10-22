import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from './common/Avatar';
import Icon from './common/Icon';
import { useAuth, useToast } from '../contexts/contexts';

export default function UserMenu() {
  const { user, logout, isModerator } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!isOpen) return undefined;
    const close = (event) => {
      if (event.type === 'keydown' && event.key !== 'Escape') return;
      if (event.type === 'mousedown' && wrapperRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [isOpen]);

  async function handleLogout() {
    setIsOpen(false);
    await logout();
    toast.info('Você saiu da sua conta.');
    navigate('/');
  }

  return (
    <div className="popover-anchor" ref={wrapperRef}>
      <button type="button" className="user-chip" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-haspopup="menu" aria-label={`Menu da conta de ${user.name}`}>
        <Avatar user={user} size="sm" />
        <span className="user-chip__name">{user.name.split(' ')[0]}</span>
      </button>
      {isOpen && (
        <div className="popover popover--menu" role="menu">
          <div className="popover__identity">
            <strong>{user.name}</strong>
            <span>{user.course} · {user.period}º período</span>
          </div>
          <Link role="menuitem" to="/perfil" onClick={() => setIsOpen(false)}><Icon name="user" /> Meu perfil</Link>
          {isModerator && <Link role="menuitem" to="/moderacao" onClick={() => setIsOpen(false)}><Icon name="shield" /> Painel de moderação</Link>}
          <button role="menuitem" type="button" onClick={handleLogout}><Icon name="logout" /> Sair</button>
        </div>
      )}
    </div>
  );
}
