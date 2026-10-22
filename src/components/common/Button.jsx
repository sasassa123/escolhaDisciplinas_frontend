import { Link } from 'react-router-dom';

/**
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'} [props.variant='primary'] - Estilo visual do botão
 * @param {'sm'|'md'} [props.size='md'] - Tamanho
 * @param {'button'|'submit'} [props.type='button'] - Tipo HTML do botão
 * @param {string} [props.to] - Se informado, renderiza um link interno com cara de botão
 * @param {string} [props.href] - Se informado, renderiza um link externo/arquivo com cara de botão
 * @param {Function} [props.onClick] - Função chamada no clique
 * @param {boolean} [props.disabled=false] - Desabilita o botão
 * @param {boolean} [props.isLoading=false] - Mostra o estado de carregamento e desabilita
 */
export default function Button({
  children, variant = 'primary', size = 'md', type = 'button', to, href, onClick,
  disabled = false, isLoading = false, className = '', ...rest
}) {
  const classes = `button button--${variant} button--${size} ${isLoading ? 'is-loading' : ''} ${className}`.trim();

  if (to) {
    return <Link to={to} className={classes} {...rest}>{children}</Link>;
  }
  if (href) {
    return <a href={href} className={classes} {...rest}>{children}</a>;
  }
  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled || isLoading} aria-busy={isLoading || undefined} {...rest}>
      {children}
    </button>
  );
}
