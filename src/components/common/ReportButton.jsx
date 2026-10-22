import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Field from './Field';
import Icon from './Icon';
import useRequireAuth from '../../hooks/useRequireAuth';
import { useMeta, useToast } from '../../contexts/contexts';
import { createReport, getErrorMessage } from '../../services/api';

const TARGET_NAMES = {
  material: 'este material',
  answer: 'esta resposta',
  review: 'esta avaliação',
  question: 'esta pergunta',
};

/**
 * Botão "Denunciar" com o formulário de motivo (RF09/US05).
 */
export default function ReportButton({ targetType, targetId, isMine = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const requireAuth = useRequireAuth();
  const { meta } = useMeta();
  const toast = useToast();

  if (isMine) return null;

  function open() {
    if (!requireAuth('para denunciar conteúdo')) return;
    setReason('');
    setDetails('');
    setError('');
    setIsOpen(true);
  }

  async function submit(event) {
    event.preventDefault();
    if (!reason) {
      setError('Escolha um motivo');
      return;
    }
    setIsSending(true);
    try {
      const result = await createReport({ targetType, targetId, reason, details });
      toast.success(result.message);
      setIsOpen(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <button type="button" className="text-action text-action--muted" onClick={open}>
        <Icon name="flag" /> Denunciar
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Denunciar ${TARGET_NAMES[targetType]}`}
        description="A moderação revisa cada denúncia. O conteúdo continua visível até a decisão."
        size="sm"
      >
        <form onSubmit={submit} className="form">
          <fieldset className="choice-list">
            <legend className="field__label">Motivo</legend>
            {meta?.reportReasons.map((option) => (
              <label key={option.value} className={`choice ${reason === option.value ? 'is-selected' : ''}`}>
                <input type="radio" name="reason" value={option.value} checked={reason === option.value} onChange={() => { setReason(option.value); setError(''); }} />
                {option.label}
              </label>
            ))}
          </fieldset>
          <Field label="Detalhes" optional={reason !== 'outro'} hint="Ajuda a moderação a decidir mais rápido.">
            {(props) => <textarea {...props} rows={3} maxLength={600} value={details} onChange={(e) => setDetails(e.target.value)} />}
          </Field>
          {error && <p className="form__error" role="alert">{error}</p>}
          <div className="form__actions">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="danger" isLoading={isSending}>Enviar denúncia</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
