import '../../styles/LoadingSpinner.css';

export default function LoadingSpinner({ label = 'Carregando...' }) {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <span className="loading-spinner-circle" aria-hidden="true" />
      <span className="loading-spinner-label">{label}</span>
    </div>
  );
}
