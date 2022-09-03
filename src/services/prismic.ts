import Prismic from '@prismicio/client';

/**
 * we're using the Prismic CMS, a headless CMS - content
 * management system for administration get access and
 * create content that will be shared through an API instead
 * of directly uploading it to a particular output
 * (like web page rendering).
 *
 * it's has a free plan, just sign up and create a new
 * type (post) and config the structure: id, title and
 * content (rich text).
 *
 * next, turn the api access private and generate the access
 * token to get the post (subscription logic).
 */

/**
 * Prismic recommend us to instantiate a new client at
 * every call, that we exporting like this.
 */
export function getPrismicClient(req?: unknown) {
  const prismic = Prismic.client(process.env.PRISMIC_ENDPOINT, {
    req,
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });

  return prismic;
}
