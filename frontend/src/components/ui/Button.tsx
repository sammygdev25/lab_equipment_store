import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'md' | 'lg';
  to?: string;
  href?: string;
  children?: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', to, href, className = '', children, type = 'button', ...rest }: ButtonProps) {
  const cls = ['btn', variant === 'ghost' ? 'ds-btn-ghost' : 'btn-' + variant, size === 'lg' ? 'ds-btn-lg' : '', className]
    .filter(Boolean)
    .join(' ');
  if (to) {
    return <Link to={to} className={cls}>{children}</Link>;
  }
  if (href) {
    // Only an absolute external link leaves the page; a hash or relative link stays in it (an in-page
    // anchor opened in a new tab lands on a blocked preview URL).
    const external = /^(https?:)?\/\//.test(href);
    return external
      ? <a href={href} className={cls} target="_blank" rel="noreferrer">{children}</a>
      : <a href={href} className={cls}>{children}</a>;
  }
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
}

export default Button;
