// Tons fixos por usuário para os avatares de iniciais
const TONES = ['#1f4d42', '#7a3e2b', '#38506e', '#6b4f7a', '#5c6631', '#8a5a14', '#2e5f6b'];

export default function Avatar({ user, size = 'md' }) {
  const tone = TONES[(user?.id || 0) % TONES.length];
  return (
    <span className={`avatar avatar--${size}`} style={{ '--avatar-tone': tone }} aria-hidden="true">
      {user?.initials || '?'}
    </span>
  );
}
