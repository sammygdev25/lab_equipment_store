export function Spinner({ className = '' }: { className?: string }) {
  return <span className={['ds-spinner', className].filter(Boolean).join(' ')} role="status" aria-label="Loading" />;
}

export function Skeleton({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={['ds-stack', className].filter(Boolean).join(' ')} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="ds-skeleton" />
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="ds-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="ds-card">
          <div className="ds-media ds-skeleton" />
          <div className="ds-card-body">
            <div className="ds-skeleton" />
            <div className="ds-skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadingBlock({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="ds-loading">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}

export default LoadingBlock;
