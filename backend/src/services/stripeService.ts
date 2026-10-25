import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

if (!STRIPE_SECRET_KEY) {
  console.warn('[StripeService] STRIPE_SECRET_KEY is not set. Stripe calls will fail until it is configured.');
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

/**
 * Converts a decimal dollar amount (e.g. order.total_amount) into an integer
 * amount of cents, as required by the Stripe API.
 */
export function toStripeAmount(amount: number | string): number {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Math.round(numeric * 100);
}

export interface CreatePaymentIntentParams {
  orderId: number;
  amount: number | string;
  currency?: string;
  receiptEmail?: string;
}

/**
 * Creates a Stripe PaymentIntent for a medical lab equipment order.
 * The resulting client secret is returned to the frontend's CheckoutForm
 * so the customer can complete payment; the PaymentIntent id is then
 * persisted on the Order as stripe_payment_intent_id.
 */
export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<Stripe.PaymentIntent> {
  const { orderId, amount, currency = 'usd', receiptEmail } = params;

  return stripe.paymentIntents.create({
    amount: toStripeAmount(amount),
    currency,
    receipt_email: receiptEmail,
    metadata: {
      orderId: String(orderId),
      platform: 'medlab-equipment-ordering',
    },
    automatic_payment_methods: { enabled: true },
  });
}

/**
 * Retrieves a PaymentIntent by id, used when reconciling order status.
 */
export async function retrievePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Cancels a PaymentIntent, e.g. if an order is abandoned before payment.
 */
export async function cancelPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.cancel(paymentIntentId);
}

/**
 * Verifies and constructs a Stripe event from the raw webhook request body
 * and signature header. The raw body MUST be used (not JSON-parsed) for
 * signature verification to succeed.
 */
export function constructWebhookEvent(
  payload: Buffer | string,
  signature: string | string[] | undefined
): Stripe.Event {
  if (!signature) {
    throw new Error('Missing Stripe signature header');
  }
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    STRIPE_WEBHOOK_SECRET
  );
}

/**
 * Maps a Stripe PaymentIntent status to this app's Order.status values.
 */
export function mapPaymentIntentStatusToOrderStatus(
  stripeStatus: Stripe.PaymentIntent.Status
): string {
  switch (stripeStatus) {
    case 'succeeded':
      return 'paid';
    case 'processing':
      return 'processing';
    case 'requires_payment_method':
    case 'requires_confirmation':
    case 'requires_action':
      return 'pending';
    case 'canceled':
      return 'cancelled';
    default:
      return 'pending';
  }
}

export default stripe;