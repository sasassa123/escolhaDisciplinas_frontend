/**
 * Rodape no final de todas as páginas.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>© {currentYear} Gangue do Patinete — Escolha de Disciplinas</p>
    </footer>
  );
}