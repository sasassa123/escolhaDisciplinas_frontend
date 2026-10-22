const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const relativeFormatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

/** "12 mar 2026" */
export function formatDate(iso) {
  return iso ? dateFormatter.format(new Date(iso)).replace(/ de /g, ' ').replace('.', '') : '';
}

export function formatDateTime(iso) {
  return iso ? dateTimeFormatter.format(new Date(iso)).replace(',', ' às') : '';
}

/** "há 3 dias", "ontem", "há 2 meses" — volta para a data absoluta depois de 1 ano. */
export function timeAgo(iso) {
  if (!iso) return '';
  let value = (new Date(iso).getTime() - Date.now()) / 1000;
  const steps = [[60, 'second'], [60, 'minute'], [24, 'hour'], [30, 'day'], [12, 'month']];
  for (const [size, unit] of steps) {
    if (Math.abs(value) < size) {
      if (unit === 'second') return 'agora mesmo';
      return relativeFormatter.format(Math.round(value), unit);
    }
    value /= size;
  }
  return formatDate(iso);
}

export function formatFileSize(bytes) {
  if (bytes === null || bytes === undefined) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
}

export function plural(count, singular, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function formatScore(value) {
  return value === null || value === undefined ? '—' : value.toFixed(1).replace('.', ',');
}

export const DIFFICULTY_LABELS = ['', 'Muito fácil', 'Fácil', 'Média', 'Difícil', 'Muito difícil'];
export const WORKLOAD_LABELS = ['', 'Muito leve', 'Leve', 'Moderada', 'Pesada', 'Muito pesada'];

/** Rótulo verbal para uma média (3,6 → "Difícil"). */
export function scoreLabel(value, labels) {
  if (value === null || value === undefined) return 'Sem avaliações';
  return labels[Math.min(5, Math.max(1, Math.round(value)))];
}

export const TYPE_LABELS = { obrigatoria: 'Obrigatória', optativa: 'Optativa' };

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
