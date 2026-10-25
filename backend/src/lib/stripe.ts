import Stripe from 'stripe';
import { config } from '../config';

// null until STRIPE_SECRET_KEY is set: the payment routes answer 503 and the rest of the app runs.
export const stripe: Stripe | null = config.stripeSecretKey ? new Stripe(config.stripeSecretKey) : null;
