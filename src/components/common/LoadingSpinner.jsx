/**
 * Indicador de carregamento exibido enquanto dados são buscados.
 * @param {Object} props
 * @param {string} [props.message='Carregando...'] - Texto ao lado do spinner
 */
export default function LoadingSpinner({ message = 'Carregando...' }) {
  return (
    <div className="spinner-wrapper" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}