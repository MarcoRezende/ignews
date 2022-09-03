import { query as q } from "faunadb";

import { fauna } from "../../../services/fauna";
import { stripe } from "../../../services/stripe";

/**
 * the current folder isn't read by Next because of the
 * underline.
 */
export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction = false
) {
  /**
   * get only the user's ref by stripe's customer id.
   *
   * do not forget to create the `user_by_stripe_customer_id` index.
   */
  const userRef = await fauna.query(
    q.Select(
      "ref",
      q.Get(q.Match(q.Index("user_by_stripe_customer_id"), customerId))
    )
  );

  /**
   * retrieves the full subscription data.
   */
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    /**
     * get the first product's price id.
     */
    price_id: subscription.items.data[0].price.id,
  };

  if (createAction) {
    await fauna.query(
      q.Create(q.Collection("subscriptions"), {
        data: subscriptionData,
      })
    );
  } else {
    /**
     * updates the subscription: `Replace` replaces
     * the entire data.
     *
     * to partial update a collection, use `Update`
     */
    await fauna.query(
      q.Replace(
        q.Select(
          "ref",
          q.Get(q.Match(q.Index("subscription_by_id"), subscriptionId))
        ),
        { data: { subscriptionData } }
      )
    );
  }
}
