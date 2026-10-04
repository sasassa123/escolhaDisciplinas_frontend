/**
 * Cartão para exibir um item (ex.: uma disciplina).
 * @param {Object} props
 * @param {string} [props.title] - Título exibido no topo do cartão
 * @param {string} [props.subtitle] - Texto secundário abaixo do título
 */
export default function Card({ title, subtitle, children }) {
  return (
    <article className="card">
      {title && <h3 className="card__title">{title}</h3>}
      {subtitle && <p>{subtitle}</p>}
      <div>{children}</div>
    </article>
  );
}