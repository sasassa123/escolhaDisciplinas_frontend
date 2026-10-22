/**
 * Indicador de carregamento exibido enquanto dados são buscados.
 * @param {Object} props
 * @param {string} [props.message='Carregando...'] - Texto ao lado do spinner
 * @param {boolean} [props.inline=false] - Versão compacta, sem espaçamento extra
 */
export default function LoadingSpinner({ message = 'Carregando...', inline = false }) {
  return (
    <div className={`spinner-wrapper ${inline ? 'spinner-wrapper--inline' : ''}`} role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
