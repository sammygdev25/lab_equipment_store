import { Button } from '../components/ui';
import { Icon } from '../components/icons';

interface CategoryListPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function CategoryListPagination({
  currentPage,
  totalPages,
  onPageChange,
}: CategoryListPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="ds-pagination" aria-label="Catalog pagination">
      <Button
        variant="ghost"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <Icon name="chevron-left" size={16} />
        Previous
      </Button>
      <span className="ds-muted">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="ghost"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        Next
        <Icon name="chevron-right" size={16} />
      </Button>
    </nav>
  );
}