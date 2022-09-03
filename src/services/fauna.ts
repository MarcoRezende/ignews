import { Client } from "faunadb";

// install through yarn add faunadb

/**
 * FaunaDB is a no schema database, which means
 * it uses collections/documents. One collection same
 * can have a row with email and phone, and other
 * with email only.
 *
 * There are alternatives, like DynamoDB, Firebase,
 * Supabase, etc.
 *
 * over the FaunaDB dashboard, we've set a
 * index for email. It increments the performance on
 * search
 */

/**
 * It's important to make request through the Next
 * Node Server (getServerSideProps and getStaticProps), or
 * the Next Route API, so no credential are leaked.
 */
export const fauna = new Client({
  secret: process.env.FAUNADB_KEY,
});
