import { useId } from 'react';

/**
 * Campo de formulário com rótulo, dica e mensagem de erro ligados por aria.
 * Recebe o controle (input/select/textarea) como função para repassar id e aria.
 *
 * <Field label="E-mail" hint="..." error={erro}>
 *   {(props) => <input type="email" {...props} />}
 * </Field>
 */
export default function Field({ label, hint, error, optional = false, children, className = '' }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`.trim()}>
      <label className="field__label" htmlFor={id}>
        {label}
        {optional && <span className="field__optional">opcional</span>}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {hint && <p className="field__hint" id={hintId}>{hint}</p>}
      {error && <p className="field__error" id={errorId}>{error}</p>}
    </div>
  );
}
