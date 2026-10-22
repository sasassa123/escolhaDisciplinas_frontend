import Button from '../components/common/Button';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function NotFound({ message = 'Essa página não existe ou mudou de endereço.' }) {
  useDocumentTitle('Página não encontrada');
  return (
    <main className="page page--narrow not-found">
      <p className="not-found__code">404</p>
      <h1 className="page-title">Nada no acervo com esse endereço</h1>
      <p className="lead">{message}</p>
      <div className="not-found__actions">
        <Button to="/disciplinas">Ver disciplinas</Button>
        <Button to="/" variant="ghost">Página inicial</Button>
      </div>
    </main>
  );
}
