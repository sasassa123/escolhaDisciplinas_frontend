import { Link } from 'react-router-dom';
import { useMeta } from '../contexts/contexts';

/**
 * Rodapé no final de todas as páginas.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { meta } = useMeta();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div>
          <p className="footer__title">acervo</p>
          <p className="footer__text">
            Feito por alunos, para alunos{meta ? ` de ${meta.course} do ${meta.institution}` : ''}.
            Não é um canal oficial da coordenação.
          </p>
        </div>
        <nav className="footer__links" aria-label="Rodapé">
          <Link to="/disciplinas">Disciplinas</Link>
          <Link to="/comparar">Comparar</Link>
          <Link to="/sobre">Como funciona</Link>
          <Link to="/sobre#regras">Regras da comunidade</Link>
        </nav>
      </div>
      <p className="footer__credit">© {currentYear} Gangue do Patinete — Leonardo de Avila, Matheus Pelissari, Pedro Gulin e Felippe Matias</p>
    </footer>
  );
}
