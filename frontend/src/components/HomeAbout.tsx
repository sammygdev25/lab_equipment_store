import { Section, Split, Card, CardBody } from '../components/ui';
import { Icon } from '../components/icons';
import type { IconName } from '../components/icons';

interface ValuePoint {
  icon: IconName;
  title: string;
  text: string;
}

interface HomeAboutProps {
  heading?: string;
  story?: string;
  values?: ValuePoint[];
}

const defaultValues: ValuePoint[] = [
  {
    icon: 'shield',
    title: 'Certified & compliant',
    text: 'Every instrument we list meets regulatory and calibration standards so your lab stays audit-ready.',
  },
  {
    icon: 'truck',
    title: 'Reliable fulfillment',
    text: 'Stock levels are tracked in real time by our sales team, so what you order is what ships.',
  },
  {
    icon: 'users',
    title: 'Built for lab teams',
    text: 'From single benches to multi-site facilities, procurement managers trust us to equip their teams.',
  },
];

export default function HomeAbout({
  heading = 'Why labs order from us',
  story = 'We started this platform to simplify how clinical and research labs source equipment. Instead of chasing scattered vendor catalogs and phone quotes, our customers browse categories, compare specs and pricing, and check out online in minutes. A dedicated sales-staff team manages inventory behind the scenes, so availability stays accurate and orders move quickly from cart to delivery.',
  values = defaultValues,
}: HomeAboutProps) {
  return (
    <Section
      eyebrow="About us"
      title={heading}
      subtitle="A straightforward way to equip your lab, backed by a team that knows the equipment."
    >
      <Split>
        <div className="ds-stack">
          <p className="ds-lead">{story}</p>
          <p className="ds-muted">
            Whether you need analytical instruments, diagnostic devices, or everyday consumables, our catalog
            is organized by category so your team finds the right equipment fast and reorders with confidence.
          </p>
        </div>
        <div className="ds-stack">
          {values.map((value) => (
            <Card key={value.title}>
              <CardBody>
                <div className="ds-cluster">
                  <Icon name={value.icon} size={20} />
                  <strong>{value.title}</strong>
                </div>
                <p className="ds-muted">{value.text}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </Split>
    </Section>
  );
}