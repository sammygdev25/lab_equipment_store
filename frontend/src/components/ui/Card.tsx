import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Slot { children?: ReactNode; className?: string }
export interface CardProps extends Slot { to?: string; onClick?: () => void }
export interface PriceProps { value: number | string | null | undefined; currency?: string; className?: string }

export function Card({ to, onClick, className = '', children }: CardProps) {
  if (to) {
    return <Link to={to} onClick={onClick} className={['ds-card', 'ds-card-link', className].filter(Boolean).join(' ')}>{children}</Link>;
  }
  return <div onClick={onClick} className={['ds-card', onClick ? 'ds-card-link' : '', className].filter(Boolean).join(' ')}>{children}</div>;
}

export function CardBody({ className = '', children }: Slot) {
  return <div className={['ds-card-body', className].filter(Boolean).join(' ')}>{children}</div>;
}

export function CardTitle({ className = '', children }: Slot) {
  return <h3 className={['ds-card-title', className].filter(Boolean).join(' ')}>{children}</h3>;
}

export function CardMeta({ className = '', children }: Slot) {
  return <div className={['ds-card-meta', className].filter(Boolean).join(' ')}>{children}</div>;
}

export function CardFooter({ className = '', children }: Slot) {
  return <div className={['ds-card-footer', className].filter(Boolean).join(' ')}>{children}</div>;
}

export function Price({ value, currency = 'USD', className = '' }: PriceProps) {
  const num = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  const code = /^[A-Za-z]{3}$/.test(currency) ? currency.toUpperCase() : '';
  const fmt = (n: number) => code ? new Intl.NumberFormat(undefined, { style: 'currency', currency: code }).format(n) : currency + Number(n || 0).toFixed(2);
  const text = Number.isFinite(num) ? fmt(num) : '';
  return <span className={['ds-price', className].filter(Boolean).join(' ')}>{text}</span>;
}

export default Card;
