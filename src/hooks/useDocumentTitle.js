import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Optativa+` : 'Optativa+ · Portal de Disciplinas';
  }, [title]);
}
