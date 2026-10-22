import Icon from '../common/Icon';
import AuthorLine from '../common/AuthorLine';
import VoteControl from '../common/VoteControl';
import ReportButton from '../common/ReportButton';
import { useMeta } from '../../contexts/contexts';
import { materialDownloadUrl, materialViewUrl, voteMaterial } from '../../services/api';
import { formatFileSize, plural } from '../../utils/format';

function fileIcon(material) {
  if (material.kind === 'link') return 'link';
  return material.file?.mimeType?.startsWith('image/') ? 'image' : 'file';
}

function fileLabel(material) {
  if (material.kind === 'link') {
    try {
      return new URL(material.url).hostname.replace(/^www\./, '');
    } catch {
      return 'Link externo';
    }
  }
  const extension = material.file?.mimeType === 'application/pdf' ? 'PDF' : 'Imagem';
  return `${extension} · ${formatFileSize(material.file?.size)}`;
}

/**
 * Um material da disciplina: quem enviou, quando, votos positivos e downloads (US02).
 */
export default function MaterialItem({ material, onChange, onDelete }) {
  const { typeLabel } = useMeta();

  return (
    <li className="material" id={`material-${material.id}`}>
      <VoteControl item={material} onVote={(value) => voteMaterial(material.id, value)} onChange={onChange} />

      <div className="material__body">
        <div className="material__tags">
          <span className={`material-type material-type--${material.type}`}>{typeLabel(material.type)}</span>
          <span className="material__semester">{material.semester}</span>
          <span className="material__prof">Prof. {material.professor}</span>
        </div>
        <h3 className="material__title">{material.title}</h3>
        {material.description && <p className="material__description">{material.description}</p>}
        <AuthorLine
          author={material.author}
          date={material.createdAt}
          prefix="Enviado por"
          extra={<span className="author-line__upvotes">· {plural(material.upvotes, 'voto positivo', 'votos positivos')}</span>}
        />
      </div>

      <div className="material__file">
        <span className="material__file-info"><Icon name={fileIcon(material)} /> {fileLabel(material)}</span>
        <div className="material__actions">
          {material.kind === 'file' && (
            <a className="button button--ghost button--sm" href={materialViewUrl(material.id)} target="_blank" rel="noreferrer">
              <Icon name="eye" /> Ver
            </a>
          )}
          <a
            className="button button--secondary button--sm"
            href={materialDownloadUrl(material.id)}
            target={material.kind === 'link' ? '_blank' : undefined}
            rel="noreferrer"
            onClick={() => onChange({ ...material, downloads: material.downloads + 1 })}
          >
            <Icon name={material.kind === 'link' ? 'external' : 'download'} /> {material.kind === 'link' ? 'Abrir' : 'Baixar'}
          </a>
        </div>
        <span className="material__downloads">{plural(material.downloads, 'acesso', 'acessos')}</span>
        <div className="material__secondary">
          {material.isMine
            ? <button type="button" className="text-action text-action--muted" onClick={() => onDelete(material)}><Icon name="trash" /> Excluir</button>
            : <ReportButton targetType="material" targetId={material.id} />}
        </div>
      </div>
    </li>
  );
}
