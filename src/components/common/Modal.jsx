import { useEffect, useId, useRef } from 'react';
import Icon from './Icon';

/**
 * Janela modal acessível usando o <dialog> nativo do navegador
 * (foco preso dentro dele e fechamento com Esc).
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {string} props.title
 * @param {string} [props.description]
 */
export default function Modal({ isOpen, onClose, title, description, children, size = 'md' }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className={`modal modal--${size}`}
      aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === dialogRef.current) onClose(); }}
    >
      {isOpen && (
        <div className="modal__panel">
          <header className="modal__header">
            <div>
              <h2 id={titleId} className="modal__title">{title}</h2>
              {description && <p className="modal__description">{description}</p>}
            </div>
            <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">
              <Icon name="close" />
            </button>
          </header>
          <div className="modal__body">{children}</div>
        </div>
      )}
    </dialog>
  );
}
