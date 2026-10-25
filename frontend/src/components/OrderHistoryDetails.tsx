import { Section, Stat } from '../components/ui';
import { Icon } from '../components/icons';
import type { User } from '../types';

interface OrderHistoryDetailsProps {
  user: User | null;
  orderCount: number;
  totalSpent: number;
}

export default function OrderHistoryDetails({ user, orderCount, totalSpent }: OrderHistoryDetailsProps) {
  return (
    <Section eyebrow="Account" title="Account details" narrow tight>
      <div className="ds-form">
        <div className="ds-form-row">
          <div className="ds-field">
            <span className="ds-label">Name</span>
            <p>{user?.name || '—'}</p>
          </div>
          <div className="ds-field">
            <span className="ds-label">Email</span>
            <p>{user?.email || '—'}</p>
          </div>
        </div>
        <div className="ds-field">
          <span className="ds-label">Account type</span>
          <p className="ds-cluster">
            <Icon name="shield" size={16} />
            {user?.role === 'staff' ? 'Sales staff' : 'Customer'}
          </p>
        </div>
        <p className="ds-help">
          Orders placed for lab equipment are tied to this account. Update your shipping details at checkout
          each time you order to keep deliveries accurate for your facility.
        </p>
        <div className="ds-grid ds-grid-2">
          <Stat value={orderCount} label="Total orders" icon="package" />
          <Stat value={`$${Number(totalSpent || 0).toFixed(2)}`} label="Lifetime spend" icon="dollar" />
        </div>
      </div>
    </Section>
  );
}