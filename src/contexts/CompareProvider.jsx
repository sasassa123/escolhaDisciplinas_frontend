import { useCallback, useEffect, useMemo, useState } from 'react';
import { CompareContext, MAX_COMPARE } from './contexts';

const STORAGE_KEY = 'portal.compare';

function readStored() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}

/**
 * Lista de disciplinas selecionadas para comparar lado a lado (US01).
 * Guarda só os códigos; a página de comparação busca os dados atualizados.
 */
export default function CompareProvider({ children }) {
  const [codes, setCodes] = useState(readStored);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
    } catch {
      // Sem storage disponível: a seleção vale só nesta aba
    }
  }, [codes]);

  const toggle = useCallback((code) => {
    setCodes((current) => {
      if (current.includes(code)) return current.filter((item) => item !== code);
      if (current.length >= MAX_COMPARE) return current;
      return [...current, code];
    });
  }, []);

  const remove = useCallback((code) => setCodes((current) => current.filter((item) => item !== code)), []);
  const clear = useCallback(() => setCodes([]), []);

  const value = useMemo(() => ({
    codes,
    has: (code) => codes.includes(code),
    isFull: codes.length >= MAX_COMPARE,
    toggle,
    remove,
    clear,
  }), [codes, toggle, remove, clear]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}
