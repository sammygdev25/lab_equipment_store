import type { ReactNode } from 'react';

export interface PageHeaderProps { eyebrow?: ReactNode; title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }

export function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="ds-page-header">
      <div className="ds-container ds-between">
        <div>
          {eyebrow ? <div className="ds-eyebrow">{eyebrow}</div> : null}
          <h1>{title}</h1>
          {subtitle ? <p className="ds-lead">{subtitle}</p> : null}
        </div>
        {actions ? <div className="ds-cluster">{actions}</div> : null}
      </div>
    </div>
  );
}

export default PageHeader;
