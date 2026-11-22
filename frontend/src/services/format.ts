export const inr = (n: number | null | undefined): string => {
  if (n == null) return '—';
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const pct = (n: number | null | undefined): string => {
  if (n == null) return '—';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
};

export const cls = (n: number | null | undefined): string =>
  n == null ? '' : n > 0 ? 'pos' : n < 0 ? 'neg' : '';
