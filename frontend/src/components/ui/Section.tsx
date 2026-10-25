import type { ReactNode } from 'react';

export interface SectionProps {
  id?: string;
  eyebrow?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  tight?: boolean;
  narrow?: boolean;
  className?: string;
  children?: ReactNode;
}

export function Section({ id, eyebrow, title, subtitle, actions, tight = false, narrow = false, className = '', children }: SectionProps) {
  const outer = ['ds-section', tight ? 'ds-section-tight' : '', className].filter(Boolean).join(' ');
  const inner = ['ds-container', narrow ? 'ds-container-narrow' : ''].filter(Boolean).join(' ');
  const hasHeader = Boolean(eyebrow || title || subtitle || actions);
  return (
    <section id={id} className={outer}>
      <div className={inner}>
        {hasHeader ? (
          <div className="ds-section-header">
            <div>
              {eyebrow ? <div className="ds-eyebrow">{eyebrow}</div> : null}
              {title ? <h2>{title}</h2> : null}
              {subtitle ? <p>{subtitle}</p> : null}
            </div>
            {actions ? <div className="ds-cluster">{actions}</div> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export default Section;
