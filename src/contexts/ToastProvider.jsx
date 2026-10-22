import { useCallback, useMemo, useRef, useState } from 'react';
import { ToastContext } from './contexts';

/**
 * Mensagens rápidas de feedback ("Material enviado", "Erro ao votar"...).
 * Uso: const toast = useToast(); toast.success('...'); toast.error('...');
 */
export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((message, tone = 'info') => {
    const id = nextId.current;
    nextId.current += 1;
    setToasts((current) => [...current.slice(-3), { id, message, tone }]);
    window.setTimeout(() => dismiss(id), tone === 'error' ? 6000 : 3800);
  }, [dismiss]);

  const value = useMemo(() => ({
    show,
    success: (message) => show(message, 'success'),
    error: (message) => show(message, 'error'),
    info: (message) => show(message, 'info'),
  }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.tone}`} role={toast.tone === 'error' ? 'alert' : 'status'}>
            <span>{toast.message}</span>
            <button type="button" className="toast__close" onClick={() => dismiss(toast.id)} aria-label="Fechar aviso">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
