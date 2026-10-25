import type { Prisma, Order } from '@prisma/client';
import { logger } from '../lib/logger';

// Called by the Stripe webhook only, once per order, inside the transaction that marks the order paid, with the
// full order row and the transaction client. Implement the app's effect of a paid order here (add the bought
// credits, confirm the booking, grant the access) and write through tx, so a failure rolls the paid mark back
// and Stripe retries the event. Never call this from a route: a client must not be able to trigger it.

export async function onOrderPaid(order: Order, tx: Prisma.TransactionClient): Promise<void> {
  void tx;
  logger.info({ orderId: order.id }, 'order paid, no fulfillment effect configured');
}
