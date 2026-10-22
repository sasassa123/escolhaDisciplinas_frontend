import { useEffect, useMemo, useState } from 'react';
import { MetaContext } from './contexts';
import { fetchMeta } from '../services/api';

/**
 * Dados fixos do portal vindos da API: instituição, curso, domínio do e-mail,
 * tipos de material, semestres e motivos de denúncia.
 */
export default function MetaProvider({ children }) {
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    fetchMeta()
      .then((data) => {
        if (ignore) return;
        setMeta(data);
        setError(null);
      })
      .catch((err) => { if (!ignore) setError(err); });
    return () => { ignore = true; };
  }, [attempt]);

  const value = useMemo(() => ({
    meta,
    error,
    retry: () => setAttempt((n) => n + 1),
    typeLabel: (type) => meta?.materialTypes.find((t) => t.value === type)?.label || type,
  }), [meta, error]);

  return <MetaContext.Provider value={value}>{children}</MetaContext.Provider>;
}
