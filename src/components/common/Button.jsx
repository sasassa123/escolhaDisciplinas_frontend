/**
 * @param {Object} props
 * @param {'primary'|'secondary'} [props.variant='primary'] - Estilo visual do botão
 * @param {'button'|'submit'} [props.type='button'] - Tipo HTML do botão
 * @param {Function} [props.onClick] - Função chamada no clique
 * @param {boolean} [props.disabled=false] - Desabilita o botão
 */
export default function Button({ children, variant = 'primary', type = 'button', onClick, disabled = false }) {
  return (
    <button type={type} className={`button button--${variant}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}