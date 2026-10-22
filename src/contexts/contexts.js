import { createContext, useContext } from 'react';

/**
 * Contextos globais da aplicação. Os providers ficam em arquivos .jsx separados
 * (AuthProvider, ToastProvider, ...) e aqui ficam só os objetos e os hooks de acesso.
 */
export const AuthContext = createContext(null);
export const ToastContext = createContext(null);
export const CompareContext = createContext(null);
export const MetaContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
export const useToast = () => useContext(ToastContext);
export const useCompare = () => useContext(CompareContext);
export const useMeta = () => useContext(MetaContext);

export const MAX_COMPARE = 4;
