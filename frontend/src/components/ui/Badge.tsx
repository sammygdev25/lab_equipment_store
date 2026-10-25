import type { ReactNode } from 'react';
import { Icon } from '../icons';
import type { IconName } from '../icons';

export interface BadgeProps { tone?: 'neutral' | 'primary' | 'soft' | 'success' | 'danger'; className?: string; children?: ReactNode }
export interface StatProps { value: ReactNode; label: ReactNode; icon?: IconName }
export interface AlertProps { tone?: 'neutral' | 'success' | 'danger'; className?: string; children?: ReactNode }

export function Badge({ tone = 'neutral', className = '', children }: BadgeProps) {
  return <span className={['badge', tone === 'neutral' ? '' : 'ds-badge-' + tone, className].filter(Boolean).join(' ')}>{children}</span>;
}

export function Stat({ value, label, icon }: StatProps) {
  return (
    <div className="ds-stat">
      {icon ? <Icon name={icon} className="ds-muted" /> : null}
      <div className="ds-stat-value">{value}</div>
      <div className="ds-stat-label">{label}</div>
    </div>
  );
}

export function Alert({ tone = 'neutral', className = '', children }: AlertProps) {
  return <div role="alert" className={['ds-alert', tone === 'neutral' ? '' : 'ds-alert-' + tone, className].filter(Boolean).join(' ')}>{children}</div>;
}

export default Badge;
