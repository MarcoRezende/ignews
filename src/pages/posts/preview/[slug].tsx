import { GetStaticPaths, GetStaticProps } from 'next';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { useEffect } from 'react';

import { getPrismicClient } from '../../../services/prismic';
import styles from '../post.module.scss';

type Post = {
  post: {
    title: string;
    slug: string;
    content: string;
    updatedAt: string;
  };
};

export default function Post({
  post: { content, title, updatedAt, slug },
}: Post) {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.activeSubscription) {
      router.push(`/posts/${slug}`);
    }
  }, [session]);

  return (
    <>
      <Head>
        <title>{title} | Ignews</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{title}</h1>
          <time>{updatedAt}</time>
          <div
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: content }}
          />

          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/">
              <a>Subscribe now 🤗</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}

/**
 * this method handles static paths.
 *
 * it's important to know what's been pre-generated,
 * since a e-commerce, for example, can have a few
 * categories, but thousands of products.
 *
 * when building, it can be cumbersome to handle
 * all of it, so we need to think carefully.
 */
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    /**
     * when empty, generates the static page when the
     * first user access it.
     *
     * we can pass the path of a dynamic parametrized (i.e id or slug)
     * route, and when we build the project, the page will be
     * generated in advance.
     */
    paths: [],
    /**
     * it has tree possible values:
     *   - true: when someone access a static page for the first time,
     *     it will make the needed request from the client
     *     side. The bad part: it won't be index by crawlers, since there's
     *     no content. Besides, it causes layout shifts.
     *
     *   - false: when someone access a static page not generated yet
     *     it will throw a 404 exception. It has it's uses
     *
     *   - blocking: it like 'true', but it loads the content from the
     *     SSR layer from Next.
     */
    fallback: 'blocking',
  };
};

/**
 * remember: getStaticProps doesn't have access to information
 * like user's session, so we cannot validate anything in here,
 * just get the content.
 */
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 3)),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString(
      'pt-BR',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    ),
  };

  return {
    props: { post },
    redirect: 30 * 60, // 30 minutes
  };
};
