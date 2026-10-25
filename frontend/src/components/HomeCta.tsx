import { Section, Button } from '../components/ui';
import { Icon } from '../components/icons';
import { useAuth } from '../contexts/AuthContext';

interface HomeCtaProps {
  title?: string;
  text?: string;
}

export default function HomeCta({ title, text }: HomeCtaProps) {
  const { isAuthenticated } = useAuth();

  return (
    <Section tight>
      <div className="ds-cluster ds-between">
        <div>
          <h2 className="ds-card-title">
            {title ?? 'Equip your lab with confidence'}
          </h2>
          <p className="ds-muted">
            {text ??
              'Browse certified analyzers, centrifuges and diagnostic instruments, or create an account to unlock staff pricing and faster reordering.'}
          </p>
        </div>
        <Button variant="primary" size="lg" to={isAuthenticated ? '/categories' : '/register'}>
          {isAuthenticated ? 'Browse catalog' : 'Create your account'}
          <Icon name="arrow-right" size={18} />
        </Button>
      </div>
    </Section>
  );
}