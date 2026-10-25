import type { ReactNode } from 'react';

export interface HeroProps { eyebrow?: ReactNode; title: ReactNode; text?: ReactNode; actions?: ReactNode; media?: ReactNode }

export function Hero({ eyebrow, title, text, actions, media }: HeroProps) {
  return (
    <section className="ds-hero">
      <div className={media ? 'ds-container ds-hero-inner' : 'ds-container'}>
        <div>
          {eyebrow ? <div className="ds-eyebrow">{eyebrow}</div> : null}
          <h1 className="ds-hero-title">{title}</h1>
          {text ? <p className="ds-hero-text">{text}</p> : null}
          {actions ? <div className="ds-hero-actions">{actions}</div> : null}
        </div>
        {media ? <div className="ds-hero-media">{media}</div> : null}
      </div>
    </section>
  );
}

export default Hero;
