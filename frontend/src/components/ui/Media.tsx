import type { ReactNode } from 'react';

export interface MediaProps {
  src?: string | null;
  alt?: string;
  ratio?: 'portrait' | 'wide' | 'square';
  badge?: ReactNode;
  className?: string;
}

function initials(label: string) {
  const parts = label.split(' ').filter(Boolean).slice(0, 2);
  const letters = parts.map((w) => w.charAt(0).toUpperCase()).join('');
  return letters || '?';
}

export function MediaFallback({ label = '' }: { label?: string }) {
  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label={label || 'placeholder'}>
      <rect width="400" height="400" fill="var(--ds-primary-soft)" />
      <text x="200" y="228" textAnchor="middle" fontSize="88" fontWeight="700" fill="var(--ds-primary)" fontFamily="var(--ds-font-heading)" opacity="0.8">
        {initials(label)}
      </text>
    </svg>
  );
}

export function Media({ src, alt = '', ratio = 'portrait', badge, className = '' }: MediaProps) {
  const cls = ['ds-media', ratio === 'wide' ? 'ds-media-wide' : ratio === 'square' ? 'ds-media-square' : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={cls}>
      {src ? <img src={src} alt={alt} loading="lazy" /> : <MediaFallback label={alt} />}
      {badge ? <span className="ds-media-badge">{badge}</span> : null}
    </div>
  );
}

export default Media;
