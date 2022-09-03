import { loadStripe } from "@stripe/stripe-js";

export async function getStripeJs() {
  /**
   * loads the public api (stripe-js) for frontend use.
   *
   * this means it will be visible for everyone that wants to see it
   */
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
}
