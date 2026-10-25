import { PageHeader } from '../components/ui';

interface CategoryListHeaderProps {
  resultCount?: number;
  loading?: boolean;
}

export default function CategoryListHeader({ resultCount, loading }: CategoryListHeaderProps) {
  const subtitle =
    !loading && typeof resultCount === 'number'
      ? `${resultCount} ${resultCount === 1 ? 'item' : 'items'} available`
      : 'Browse certified lab instruments, consumables and diagnostic equipment by category';

  return (
    <PageHeader
      eyebrow="Catalog"
      title="Lab Equipment Categories"
      subtitle={subtitle}
    />
  );
}