import { PageHeader } from '../components/ui';
import { Icon } from '../components/icons';

interface CheckoutHeaderProps {
  step?: 'shipping' | 'review' | 'payment';
}

const STEPS: { key: CheckoutHeaderProps['step']; label: string }[] = [
  { key: 'shipping', label: 'Shipping' },
  { key: 'review', label: 'Review' },
  { key: 'payment', label: 'Payment' },
];

export default function CheckoutHeader({ step = 'shipping' }: CheckoutHeaderProps) {
  const activeIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <PageHeader
      eyebrow="Secure checkout"
      title="Complete your equipment order"
      subtitle="Confirm your shipping details and payment to finalize your lab equipment purchase."
      actions={
        <div className="ds-cluster" aria-label="Checkout progress">
          {STEPS.map((s, idx) => (
            <span key={s.key} className="ds-cluster" style={{ alignItems: 'center' }}>
              <span
                className={`badge ${idx <= activeIndex ? 'badge-primary' : ''}`}
                style={idx <= activeIndex ? { background: 'var(--color-primary)', color: '#fff' } : undefined}
              >
                {idx < activeIndex ? <Icon name="check" size={14} /> : idx + 1}
              </span>
              <span className="ds-small ds-muted">{s.label}</span>
              {idx < STEPS.length - 1 && <Icon name="chevron-right" size={14} />}
            </span>
          ))}
        </div>
      }
    />
  );
}