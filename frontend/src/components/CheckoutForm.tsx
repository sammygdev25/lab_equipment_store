import { useState, FormEvent } from 'react';
import { Section, WithSidebar, Stack, Button, Alert, Price, Card, CardBody } from '../components/ui';
import { Icon } from '../components/icons';

interface CheckoutFormProps {
  total: number;
  onSubmit: (data: { shippingAddress: string; contactName: string; contactEmail: string; contactPhone: string; deliveryMethod: string }) => void | Promise<void>;
  loading: boolean;
}

export default function CheckoutForm({ total, onSubmit, loading }: CheckoutFormProps) {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!contactName.trim() || !contactEmail.trim() || !shippingAddress.trim()) {
      setError('Please fill in your contact details and a shipping address for the lab equipment delivery.');
      return;
    }
    await onSubmit({ shippingAddress, contactName, contactEmail, contactPhone, deliveryMethod });
  };

  return (
    <Section eyebrow="Checkout" title="Delivery & contact details" tight>
      <WithSidebar
        sidebar={
          <Card>
            <CardBody>
              <Stack gap="sm">
                <div className="ds-cluster ds-between">
                  <span className="ds-muted">Order total</span>
                  <Price value={total} />
                </div>
                <p className="ds-small ds-muted">
                  Secure card payment is processed via Stripe on the next step. Equipment ships from our
                  certified lab warehouse once payment is confirmed.
                </p>
              </Stack>
            </CardBody>
          </Card>
        }
      >
        <form className="ds-form" onSubmit={handleSubmit}>
          {error && <Alert tone="danger">{error}</Alert>}

          <div className="ds-form-row">
            <div className="ds-field">
              <label className="ds-label" htmlFor="contactName">Full name</label>
              <input
                id="contactName"
                className="input"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Dr. Jane Reyes"
              />
            </div>
            <div className="ds-field">
              <label className="ds-label" htmlFor="contactEmail">Email</label>
              <input
                id="contactEmail"
                type="email"
                className="input"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="lab.orders@yourclinic.com"
              />
            </div>
          </div>

          <div className="ds-field">
            <label className="ds-label" htmlFor="contactPhone">Phone (for delivery coordination)</label>
            <input
              id="contactPhone"
              className="input"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+1 555 010 2938"
            />
          </div>

          <div className="ds-field">
            <label className="ds-label" htmlFor="shippingAddress">Shipping address</label>
            <textarea
              id="shippingAddress"
              className="input"
              rows={4}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Lab building, street, city, postal code, country"
            />
            <span className="ds-help">Equipment is packed and insured for lab-grade handling.</span>
          </div>

          <div className="ds-field">
            <span className="ds-label">Delivery method</span>
            <div className="ds-cluster">
              <label className="ds-cluster">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="standard"
                  checked={deliveryMethod === 'standard'}
                  onChange={() => setDeliveryMethod('standard')}
                />
                <span>Standard (3-5 business days)</span>
              </label>
              <label className="ds-cluster">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="express"
                  checked={deliveryMethod === 'express'}
                  onChange={() => setDeliveryMethod('express')}
                />
                <span>Express, white-glove install (1-2 business days)</span>
              </label>
            </div>
          </div>

          <div className="ds-form-actions">
            <Button type="submit" variant="primary" size="lg" disabled={loading}>
              {loading ? 'Placing order...' : 'Continue to payment'}
              {!loading && <Icon name="arrow-right" />}
            </Button>
          </div>
        </form>
      </WithSidebar>
    </Section>
  );
}