import '../../styles/Card.css';

export default function Card({ title, subtitle, children }) {
  return (
    <article className="card">
      <h2 className="card-title">{title}</h2>
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
      {children && <div className="card-body">{children}</div>}
    </article>
  );
}
