import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './common/Icon';
import { fetchNotifications, markNotificationsRead } from '../services/api';
import { timeAgo } from '../utils/format';

const POLL_INTERVAL = 45000;

/**
 * Sino de notificações: perguntas novas em disciplinas em que o usuário é
 * veterano, respostas recebidas e decisões da moderação.
 */
export default function NotificationBell() {
  const [data, setData] = useState({ items: [], unread: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const load = useCallback(() => {
    fetchNotifications().then(setData).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, POLL_INTERVAL);
    return () => window.clearInterval(timer);
  }, [load]);

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

  function toggle() {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening) load();
  }

  async function markAll() {
    setData((current) => ({ unread: 0, items: current.items.map((n) => ({ ...n, read: true })) }));
    await markNotificationsRead().catch(() => {});
  }

  function openItem(item) {
    setIsOpen(false);
    if (!item.read) {
      setData((current) => ({
        unread: Math.max(0, current.unread - 1),
        items: current.items.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
      }));
      markNotificationsRead(item.id).catch(() => {});
    }
  }

  return (
    <div className="popover-anchor" ref={wrapperRef}>
      <button
        type="button"
        className="icon-button icon-button--header"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-label={data.unread ? `Notificações: ${data.unread} não lidas` : 'Notificações'}
      >
        <Icon name="bell" />
        {data.unread > 0 && <span className="dot-count">{data.unread > 9 ? '9+' : data.unread}</span>}
      </button>

      {isOpen && (
        <div className="popover popover--notifications">
          <div className="popover__header">
            <strong>Notificações</strong>
            {data.unread > 0 && <button type="button" className="text-action" onClick={markAll}>Marcar todas como lidas</button>}
          </div>
          {data.items.length === 0 ? (
            <p className="popover__empty">Nada por aqui ainda. Quando alguém responder suas perguntas ou perguntar algo numa disciplina que você já cursou, aparece aqui.</p>
          ) : (
            <ul className="notification-list">
              {data.items.map((item) => (
                <li key={item.id}>
                  <Link to={item.link || '/'} className={`notification ${item.read ? '' : 'is-unread'}`} onClick={() => openItem(item)}>
                    <span className="notification__message">{item.message}</span>
                    <span className="notification__time">{timeAgo(item.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
