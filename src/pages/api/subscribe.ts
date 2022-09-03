import { query as q } from 'faunadb';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

import { fauna } from '../../services/fauna';
import { stripe } from '../../services/stripe';

type User = {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
};

export default async (request: NextApiRequest, response: NextApiResponse) => {
  // only POST method allowed.
  if (request.method === 'POST') {
    /**
     * since this is an isolated environment and we cannot use the
     * the any react/next/frontend hook, we need to get the user from
     * where it was stored - cookies (not localStorage, because it's not
     * accessible from Next Server).
     *
     * Next do it for us. We just need to pass the request object.
     */
    const session = await getSession({ req: request });

    const user = await fauna.query<User>(
      q.Get(q.Match(q.Index('users_by_email'), q.Casefold(session.user.email)))
    );

    let costumerId = user.data.stripe_customer_id;

    /**
     * if the previously created user doesn't have
     * a costumer id saved, we create one stripe user
     * and his customer id.
     */
    if (!costumerId) {
      // creates a stripe user
      const stripeCostumer = await stripe.customers.create({
        email: session.user.email,
        //   metadata
      });

      await fauna.query(
        /**
         * updates a user that matches the specified
         * criteria - the Ref (the fauna id)
         */
        q.Update(q.Ref(q.Collection('users'), user.ref.id), {
          data: {
            stripe_customer_id: stripeCostumer.id,
          },
        })
      );

      costumerId = stripeCostumer.id;
    }

    // creates a stripe session.
    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: costumerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      //   priceId and related product quantity
      line_items: [{ price: 'price_1K2FItHz7GZUTFQOmnWajgVW', quantity: 1 }],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    return response.status(200).json({ sessionId: stripeCheckoutSession.id });
  } else {
    response.setHeader('Allow', 'POST');
    response.status(405).end('Method not allowed');
  }
};
