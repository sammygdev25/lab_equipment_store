/**
 * Typed utility functions for formatting display values.
 */

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const formatNumber = (value: number, decimals: number = 0): string => {
  if (Math.abs(value) >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + 'B';
  if (Math.abs(value) >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (Math.abs(value) >= 1_000) return (value / 1_000).toFixed(1) + 'K';
  return value.toFixed(decimals);
};

export const formatPercentage = (value: number, decimals: number = 2): string =>
  `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;

export const classNames = (...classes: (string | boolean | undefined | null)[]): string =>
  classes.filter(Boolean).join(' ');
