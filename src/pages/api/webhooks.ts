import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Stripe from "stripe";

import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

/**
 * webhooks are away of communicate with another service and
 * keep a your app aware of whats happening.
 *
 * the events emitted from Stripe (checkout completed, invoice
 * emitted, invoice paid, etc) will be sent to here.
 *
 * in order to use it locally, for tests, we must the stripe client, config
 * it (stripe login) and run the forward command: stripe listen --forward-to localhost:3000/api/webhooks
 */

/**
 * buffer function to get parse the received data from
 * stripe.
 */
async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

/**
 * disable bodyParser to allow buffer request
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Set doesn't allow duplicated values and gives us
 * some useful methods like `has`.
 */
const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.update",
  "customer.subscription.deleted",
]);

export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === "POST") {
    const buf = await buffer(request);
    // get the secret from header to use below
    const secret = request.headers["stripe-signature"];

    let event: Stripe.Event;

    try {
      /**
       * stripe recommended way of getting the event
       * by checking the signature first.
       *
       * the environment variable is provided after run the
       * forward command.
       */
      event = stripe.webhooks.constructEvent(
        buf,
        secret,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return response.status(400).send(`Webhook error: ${err.message}`);
    }

    const { type } = event;

    if (relevantEvents.has(type)) {
      try {
        switch (type) {
          case "customer.subscription.update":
          case "customer.subscription.deleted":
            const subscription = event.data.object as Stripe.Subscription;

            await saveSubscription(
              subscription.id,
              subscription.customer.toString(),
              false
            );

            break;
          case "checkout.session.completed":
            const checkoutSession = event.data
              .object as Stripe.Checkout.Session;

            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString(),
              true
            );

            break;

          default:
            throw new Error("Unhandled event type: " + type);
        }
      } catch (err) {
        return response.json({ error: "Webhook handler failed" });
      }
    }

    response.json({ received: true });
  } else {
    response.setHeader("Allow", "POST");
    response.status(405).end("Method not allowed");
  }
};
