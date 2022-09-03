import { query } from 'faunadb';
import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

import { fauna } from '../../../services/fauna';

/**
 * the path till here and the file name (...nextauth) are important
 * for the app to work.
 *
 * on the github side, we configured a oath app that will post data (callback)
 * here (...nextauth), using the same path (http://localhost:3000/api/auth/callback)
 */

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  jwt: {
    /**
     * random key generated to encode/decode the NextAuth.js issued JWT
     *
     * on production, it's recommended to use the node-jose-tools to
     * generate one.
     */
    secret: process.env.SECRET,
  },
  /**
   * after login, there are some callback that are called, and among them we
   * have `signIn`.
   *
   * it returns the some inforamtion like the user, account, profile, etc.
   */
  callbacks: {
    /**
     * it must return false (failure) or true (success) after
     * some operation.
     */
    async signIn({ user }) {
      console.log(
        '🚀 ~ file: [...nextauth].ts ~ line 43 ~ signIn ~ user',
        user
      );
      const { email } = user;

      try {
        /**
         * this is the fauna syntax (FQL) to use a new user on DB.
         *
         * notice we're using the `query` method to run our queries.
         *
         * although we've could searched for a user with the specific email
         * and then create or not, this way allows us to make just one request.
         */
        await fauna.query(
          query.If(
            query.Not(
              query.Exists(
                query.Match(
                  /**
                   * we can do this because we've set an index on
                   * fauna dashboard.
                   *
                   * index work like a key in a object.
                   *
                   * as an analogy, rather than map row by row and
                   * find some that matches the query "email = marco@email",
                   * it goes straight to the row with the index "marco@email":
                   *
                   * "marco@email": { name: "marco", email: "marco@email" }
                   *
                   * and not:
                   * 0: { name: "marco", email: "marco@email" },
                   * 1: { ... },
                   * 2: { ... },
                   *
                   */
                  query.Index('users_by_email'),
                  query.Casefold(user.email)
                )
              )
            ),
            /**
             * this is the "then" (when it matches)
             */
            query.Create(query.Collection('users'), { data: { email } }),
            /**
             * that's the "else"
             */
            query.Get(
              query.Match(
                query.Index('users_by_email'),
                query.Casefold(user.email)
              )
            )
          )
        );

        return true;
      } catch {
        return false;
      }
    },
    /**
     * we can add extra data to the session object.
     */
    async session({ session }) {
      console.log(
        '🚀 ~ file: [...nextauth].ts ~ line 111 ~ session ~ session',
        session
      );
      try {
        const activeSubscription = await fauna.query(
          query.Get(
            query.Intersection([
              query.Match(
                query.Index('subscription_by_user_ref'),
                query.Select(
                  'ref',
                  query.Get(
                    query.Match(
                      query.Index('users_by_email'),
                      query.Casefold(session.user.email)
                    )
                  )
                )
              ),
              query.Match(query.Index('subscription_by_status'), 'active'),
            ])
          )
        );

        return {
          ...session,
          activeSubscription,
        };
      } catch (error) {
        console.error(JSON.stringify(error, null, 2));

        return {
          ...session,
          activeSubscription: null,
        };
      }
    },
  },
});
