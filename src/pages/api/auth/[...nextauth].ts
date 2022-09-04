import { query } from 'faunadb';
import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { fauna } from '../../../services/fauna';

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      const { email } = user;

      try {
        await fauna.query(
          query.If(
            query.Not(
              query.Exists(
                query.Match(
                  query.Index('users_by_email'),
                  query.Casefold(user.email)
                )
              )
            ),

            query.Create(query.Collection('users'), { data: { email } }),

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

    async session({ session }) {
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
  secret: process.env.NEXTAUTH_SECRET,
});
