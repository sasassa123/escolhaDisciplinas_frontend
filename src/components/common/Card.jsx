/**
 * Cartão genérico de conteúdo.
 * @param {Object} props
 * @param {string} [props.title] - Título exibido no topo do cartão
 * @param {string} [props.subtitle] - Texto secundário abaixo do título
 * @param {React.ReactNode} [props.actions] - Ações no canto direito do cabeçalho
 * @param {string} [props.as='article'] - Elemento HTML usado
 */
export default function Card({ title, subtitle, actions, children, className = '', as: Tag = 'article' }) {
  return (
    <Tag className={`card ${className}`.trim()}>
      {(title || actions) && (
        <header className="card__header">
          <div>
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card__actions">{actions}</div>}
        </header>
      )}
      {children}
    </Tag>
  );
}
