import type { ReactNode } from 'react';

interface Slot { children?: ReactNode; className?: string }
export interface GridProps extends Slot { size?: 'sm' | 'md' | 'lg'; cols?: 2 | 3 | 4 }
export interface WithSidebarProps extends Slot { sidebar?: ReactNode }
export interface LayoutProps extends Slot { gap?: 'xs' | 'sm' | 'md' | 'lg'; align?: 'start' | 'center' | 'end' | 'stretch'; justify?: 'start' | 'center' | 'end' | 'between' }
function layoutStyle(gap?: string, align?: string, justify?: string) {
  return { gap: gap ? `var(--space-${gap})` : undefined, alignItems: align, justifyContent: justify === 'between' ? 'space-between' : justify };
}

export function Grid({ size = 'md', cols, className = '', children }: GridProps) {
  const variant = cols ? 'ds-grid-' + cols : size === 'sm' ? 'ds-grid-sm' : size === 'lg' ? 'ds-grid-lg' : '';
  return <div className={['ds-grid', variant, className].filter(Boolean).join(' ')}>{children}</div>;
}

export function Split({ className = '', children }: Slot) {
  return <div className={['ds-grid-split', className].filter(Boolean).join(' ')}>{children}</div>;
}

export function WithSidebar({ sidebar, className = '', children }: WithSidebarProps) {
  return (
    <div className={['ds-grid-sidebar', className].filter(Boolean).join(' ')}>
      <div className="ds-stack-lg">{children}</div>
      {sidebar ? <aside className="ds-stack">{sidebar}</aside> : null}
    </div>
  );
}

export function Stack({ className = '', gap, align, justify, children }: LayoutProps) {
  return <div className={['ds-stack', className].filter(Boolean).join(' ')} style={layoutStyle(gap, align, justify)}>{children}</div>;
}

export function Cluster({ className = '', gap, align, justify, children }: LayoutProps) {
  return <div className={['ds-cluster', className].filter(Boolean).join(' ')} style={layoutStyle(gap, align, justify)}>{children}</div>;
}

export default Grid;
