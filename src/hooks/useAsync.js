import { useCallback, useEffect, useState } from 'react';

/**
 * Executa uma função assíncrona (normalmente uma chamada à API) quando as
 * dependências mudam e devolve { data, error, isLoading, reload, setData }.
 *
 * - Respostas antigas são descartadas se as dependências mudarem no meio do caminho.
 * - Durante um recarregamento, `data` continua com o último valor (evita "piscar" a tela).
 * - As dependências devem ser valores simples (texto, número, booleano).
 */
export default function useAsync(asyncFn, deps = []) {
  const [version, setVersion] = useState(0);
  const key = JSON.stringify([...deps, version]);
  const [state, setState] = useState({ key: null, data: null, error: null });

  useEffect(() => {
    let ignore = false;
    asyncFn()
      .then((data) => { if (!ignore) setState({ key, data, error: null }); })
      .catch((error) => { if (!ignore) setState((current) => ({ key, data: current.data, error })); });
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const reload = useCallback(() => setVersion((n) => n + 1), []);
  const setData = useCallback((updater) => {
    setState((current) => ({
      ...current,
      data: typeof updater === 'function' ? updater(current.data) : updater,
    }));
  }, []);

  const isLoading = state.key !== key;
  return {
    data: state.error && !isLoading ? null : state.data,
    error: isLoading ? null : state.error,
    isLoading,
    reload,
    setData,
  };
}
