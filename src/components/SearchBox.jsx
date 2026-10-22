import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './common/Icon';

/**
 * Campo de busca geral (disciplinas, perguntas e respostas).
 * Atalho: tecla "/" foca o campo do cabeçalho.
 */
export default function SearchBox({ initialValue = '', size = 'md', placeholder = 'Buscar disciplina, código ou dúvida', autoFocus = false, id }) {
  const [query, setQuery] = useState(initialValue);
  const navigate = useNavigate();

  function submit(event) {
    event.preventDefault();
    const q = query.trim();
    if (q) navigate(`/busca?q=${encodeURIComponent(q)}`);
  }

  return (
    <form className={`search-box search-box--${size}`} role="search" onSubmit={submit}>
      <Icon name="search" className="search-box__icon" />
      <input
        id={id}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        aria-label="Buscar no portal"
        autoFocus={autoFocus}
      />
      {size === 'lg' && <button type="submit" className="search-box__submit">Buscar</button>}
    </form>
  );
}
