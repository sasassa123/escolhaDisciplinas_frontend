import { getErrorMessage } from '../../services/api';
import Button from './Button';
import Icon from './Icon';

/**
 * Estado vazio de uma lista: explica por que está vazio e sugere a próxima ação.
 */
export function EmptyState({ title, children, action, icon = 'book' }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon"><Icon name={icon} /></span>
      <p className="empty-state__title">{title}</p>
      {children && <p className="empty-state__text">{children}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}

/**
 * Erro ao carregar dados, com botão de tentar novamente.
 */
export function ErrorState({ error, onRetry, message }) {
  return (
    <div className="error-state" role="alert">
      <Icon name="alert" />
      <div>
        <p>{message || getErrorMessage(error, 'Não foi possível carregar esta informação.')}</p>
        {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Tentar novamente</Button>}
      </div>
    </div>
  );
}
