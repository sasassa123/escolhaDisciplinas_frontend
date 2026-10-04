/**
 * Cartão para exibir um item (ex.: uma disciplina).
 * @param {Object} props
 * @param {string} [props.title] - Título exibido no topo do cartão
 */
export default function Card({ title, children }) {
  return (
    <article className="card">
      {title && <h3 className="card__title">{title}</h3>}
      <div>{children}</div>
    </article>
  );
}