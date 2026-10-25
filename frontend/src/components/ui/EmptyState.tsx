import type { ReactNode } from 'react';
import { Icon } from '../icons';
import type { IconName } from '../icons';

export interface EmptyStateProps { icon?: IconName; title: ReactNode; text?: ReactNode; action?: ReactNode }

export function EmptyState({ icon = 'package', title, text, action }: EmptyStateProps) {
  return (
    <div className="ds-empty">
      <Icon name={icon} className="ds-empty-icon" size={40} />
      <h3>{title}</h3>
      {text ? <p>{text}</p> : null}
      {action ? <div className="ds-cluster">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
