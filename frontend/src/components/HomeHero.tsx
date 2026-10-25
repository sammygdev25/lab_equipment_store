import { Hero, Button, Media } from '../components/ui';
import { Icon } from '../components/icons';

export interface HomeHeroProps {
  imageUrl?: string;
}

export default function HomeHero({ imageUrl }: HomeHeroProps) {
  return (
    <Hero
      eyebrow="Lab Equipment, Delivered Fast"
      title="Precision Instruments for Every Medical Laboratory"
      text="Browse a curated catalog of diagnostic analyzers, centrifuges, microscopes and consumables sourced from trusted manufacturers. Order in minutes, track fulfillment, and manage inventory with tools built for lab procurement teams."
      actions={
        <>
          <Button to="/categories" size="lg">
            Shop Equipment
            <Icon name="arrow-right" size={18} />
          </Button>
          <Button to="/staff/login" variant="ghost" size="lg">
            Sales Staff Login
          </Button>
        </>
      }
      media={imageUrl ? <Media src={imageUrl} alt="Medical lab equipment on display" ratio="wide" /> : undefined}
    />
  );
}