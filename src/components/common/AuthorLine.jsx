import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import Icon from './Icon';
import { formatDate, timeAgo } from '../../utils/format';

/**
 * "Fulano · Veterano · há 3 dias" — autor de um material, resposta ou avaliação.
 */
export default function AuthorLine({ author, date, prefix, extra }) {
  return (
    <div className="author-line">
      <Avatar user={author} size="sm" />
      <span className="author-line__text">
        {prefix && <span className="author-line__prefix">{prefix} </span>}
        {author.id ? <Link to={`/usuarios/${author.id}`} className="author-line__name">{author.name}</Link> : <span>{author.name}</span>}
        {author.isVeteran && (
          <span className="badge badge--veteran" title="Já cursou esta disciplina">
            <Icon name="star" /> Veterano
          </span>
        )}
        {author.role === 'moderator' && <span className="badge badge--mod">Moderação</span>}
        {date && <time className="author-line__date" dateTime={date} title={formatDate(date)}>{timeAgo(date)}</time>}
        {extra}
      </span>
    </div>
  );
}
