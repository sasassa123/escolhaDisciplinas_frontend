import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Icon from '../components/common/Icon';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AuthorLine from '../components/common/AuthorLine';
import { EmptyState, ErrorState } from '../components/common/States';
import useAsync from '../hooks/useAsync';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useToast } from '../contexts/contexts';
import { API_BASE_URL, decideReport, fetchReports, getErrorMessage } from '../services/api';
import { formatDateTime, timeAgo } from '../utils/format';

const STATUS_LABELS = {
  pending: 'Pendente',
  approved: 'Aprovado — conteúdo mantido',
  removed: 'Removido',
  restored: 'Restaurado',
};

const ACTION_LABELS = {
  approve: 'aprovou (manteve o conteúdo)',
  remove: 'removeu o conteúdo',
  restore: 'restaurou o conteúdo',
};

function ReportCard({ report, onDecide, busyAction }) {
  const { target } = report;

  return (
    <article className={`report report--${report.status}`}>
      <header className="report__header">
        <span className="report__reason"><Icon name="flag" /> {report.reasonLabel}</span>
        <span className={`status-pill status-pill--${report.status}`}>{STATUS_LABELS[report.status]}</span>
      </header>

      <p className="report__by">
        Denunciado por <strong>{report.reporter?.name || 'usuário'}</strong> {timeAgo(report.createdAt)}
        {report.sameTargetCount > 1 && <> · <strong>{report.sameTargetCount} denúncias</strong> sobre este conteúdo</>}
      </p>
      {report.details && <blockquote className="report__details">“{report.details}”</blockquote>}

      <div className="report__target">
        {target.missing ? (
          <p className="muted">O conteúdo não existe mais.</p>
        ) : (
          <>
            <p className="report__target-type">
              {target.label} em <span className="code-tag code-tag--sm">{target.disciplineCode}</span>
              {target.status === 'deleted' && <span className="badge badge--removed">Excluído pelo autor</span>}
            </p>
            <p className="report__target-title">{target.title}</p>
            {target.body && <p className="report__target-body">{target.body}</p>}
            {target.meta && <p className="report__target-meta">{target.meta}</p>}
            <div className="report__target-footer">
              <AuthorLine author={target.author} date={target.createdAt} prefix="Autor:" />
              <span className="report__links">
                {target.fileUrl && <a href={`${API_BASE_URL}${target.fileUrl}`} target="_blank" rel="noreferrer" className="text-action"><Icon name="eye" /> Abrir arquivo</a>}
                {target.externalUrl && <a href={target.externalUrl} target="_blank" rel="noreferrer noopener" className="text-action"><Icon name="external" /> Abrir link</a>}
                {target.link && target.status === 'active' && <Link to={target.link} className="text-action">Ver no portal <Icon name="chevron" /></Link>}
              </span>
            </div>
          </>
        )}
      </div>

      {report.decisions.length > 0 && (
        <ul className="report__history">
          {report.decisions.map((d) => (
            <li key={`${d.action}-${d.at}`}>
              <Icon name="clock" /> <strong>{d.moderatorName}</strong> {ACTION_LABELS[d.action]} em {formatDateTime(d.at)}
            </li>
          ))}
        </ul>
      )}

      {!target.missing && target.status !== 'deleted' && (
        <footer className="report__actions">
          {report.status === 'pending' && (
            <>
              <Button variant="secondary" size="sm" onClick={() => onDecide(report, 'approve')} isLoading={busyAction === 'approve'} disabled={Boolean(busyAction)}>
                <Icon name="check" /> Aprovar e manter
              </Button>
              <Button variant="danger" size="sm" onClick={() => onDecide(report, 'remove')} isLoading={busyAction === 'remove'} disabled={Boolean(busyAction)}>
                <Icon name="trash" /> Remover conteúdo
              </Button>
            </>
          )}
          {report.status === 'removed' && (
            <Button variant="secondary" size="sm" onClick={() => onDecide(report, 'restore')} isLoading={busyAction === 'restore'} disabled={Boolean(busyAction)}>
              <Icon name="restore" /> Restaurar conteúdo
            </Button>
          )}
          {['approved', 'restored'].includes(report.status) && (
            <Button variant="ghost" size="sm" onClick={() => onDecide(report, 'remove')} isLoading={busyAction === 'remove'} disabled={Boolean(busyAction)}>
              <Icon name="trash" /> Remover mesmo assim
            </Button>
          )}
        </footer>
      )}
    </article>
  );
}

/**
 * Painel de moderação (RF09/US05): denúncias pendentes com o conteúdo original
 * e ações de remover, aprovar ou restaurar, registrando quem decidiu e quando.
 */
export default function Moderation() {
  useDocumentTitle('Moderação');
  const [status, setStatus] = useState('pending');
  const [busy, setBusy] = useState({});
  const toast = useToast();
  const { data, error, isLoading, reload } = useAsync(() => fetchReports(status), [status]);

  async function decide(report, action) {
    if (action === 'remove' && !window.confirm('Remover este conteúdo do portal? O autor será notificado. Dá para restaurar depois.')) return;
    setBusy({ id: report.id, action });
    try {
      await decideReport(report.id, action);
      toast.success({
        approve: 'Denúncia arquivada. O conteúdo continua no ar.',
        remove: 'Conteúdo removido do portal.',
        restore: 'Conteúdo restaurado.',
      }[action]);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
      reload();
    } finally {
      setBusy({});
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <p className="kicker"><Icon name="shield" /> Área de moderação</p>
        <h1 className="page-title">Denúncias</h1>
        <p className="lead">Revise o conteúdo denunciado. Remover tira o item do ar e avisa o autor; toda decisão fica registrada e pode ser revertida.</p>
      </header>

      <div className="segmented" role="group" aria-label="Situação das denúncias">
        <button type="button" className={status === 'pending' ? 'is-active' : ''} aria-pressed={status === 'pending'} onClick={() => setStatus('pending')}>
          Pendentes {data && <span>{data.counts.pending}</span>}
        </button>
        <button type="button" className={status === 'resolved' ? 'is-active' : ''} aria-pressed={status === 'resolved'} onClick={() => setStatus('resolved')}>
          Resolvidas {data && <span>{data.counts.resolved}</span>}
        </button>
      </div>

      {isLoading && !data && <LoadingSpinner message="Carregando denúncias..." />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && data.items.length === 0 && (
        <EmptyState title={status === 'pending' ? 'Nenhuma denúncia pendente' : 'Nenhuma denúncia resolvida ainda'} icon="shield">
          {status === 'pending' && 'Tudo em ordem por aqui.'}
        </EmptyState>
      )}
      {data && data.items.length > 0 && (
        <div className={`report-list ${isLoading ? 'is-refreshing' : ''}`}>
          {data.items.map((report) => (
            <ReportCard key={report.id} report={report} onDecide={decide} busyAction={busy.id === report.id ? busy.action : null} />
          ))}
        </div>
      )}
    </main>
  );
}
