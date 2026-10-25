import { PageHeader } from '../components/ui';

interface OrderHistoryHeaderProps {
  userName?: string;
  orderCount?: number;
}

export default function OrderHistoryHeader({ userName, orderCount }: OrderHistoryHeaderProps) {
  const subtitle = userName
    ? `Signed in as ${userName}${
        typeof orderCount === 'number'
          ? ` · ${orderCount} order${orderCount === 1 ? '' : 's'} placed`
          : ''
      }`
    : 'Track your lab equipment orders and shipments';

  return (
    <PageHeader
      eyebrow="Account"
      title="Order history"
      subtitle={subtitle}
    />
  );
}