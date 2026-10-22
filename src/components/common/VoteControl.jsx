import { useState } from 'react';
import Icon from './Icon';
import useRequireAuth from '../../hooks/useRequireAuth';
import { useToast } from '../../contexts/contexts';
import { getErrorMessage } from '../../services/api';

/**
 * Voto positivo/negativo (RF07). Clicar de novo no mesmo voto retira o voto.
 * @param {Object} props
 * @param {{ score: number, upvotes: number, myVote: number, isMine: boolean }} props.item
 * @param {(value: number) => Promise<object>} props.onVote - Chama a API e devolve o item atualizado
 * @param {(item: object) => void} props.onChange - Recebe o item atualizado
 */
export default function VoteControl({ item, onVote, onChange, layout = 'vertical' }) {
  const [isSending, setIsSending] = useState(false);
  const requireAuth = useRequireAuth();
  const toast = useToast();

  async function vote(value) {
    if (!requireAuth('para votar')) return;
    if (item.isMine) {
      toast.info('Você não pode votar no seu próprio conteúdo.');
      return;
    }
    setIsSending(true);
    try {
      const updated = await onVote(item.myVote === value ? 0 : value);
      onChange(updated);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível registrar seu voto.'));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className={`vote vote--${layout}`} aria-label={`${item.score} pontos, ${item.upvotes} votos positivos`}>
      <button
        type="button"
        className={`vote__button ${item.myVote === 1 ? 'is-active-up' : ''}`}
        onClick={() => vote(1)}
        disabled={isSending}
        aria-pressed={item.myVote === 1}
        aria-label="Voto positivo"
        title={item.isMine ? 'Seu conteúdo' : 'Útil'}
      >
        <Icon name="up" />
      </button>
      <span className="vote__score" title={`${item.upvotes} positivos · ${item.downvotes} negativos`}>{item.score}</span>
      <button
        type="button"
        className={`vote__button ${item.myVote === -1 ? 'is-active-down' : ''}`}
        onClick={() => vote(-1)}
        disabled={isSending}
        aria-pressed={item.myVote === -1}
        aria-label="Voto negativo"
        title={item.isMine ? 'Seu conteúdo' : 'Não ajudou'}
      >
        <Icon name="down" />
      </button>
    </div>
  );
}
