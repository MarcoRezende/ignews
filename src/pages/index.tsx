import { GetStaticProps } from 'next';
import Head from 'next/head';

import { SubscribeButton } from '../components/SubscribeButton';
import { stripe } from '../services/stripe';
import styles from '../styles/home.module.scss';

interface HomeProps {
  product: {
    priceId: string;
    amount: string;
  };
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      {/**
       * the tags in this Head, like title, will be added to
       * the main Head in the _document.
       */}
      <Head>
        <title>Home | ig.news</title>
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <h1>
            News about the <span>React</span> world.
          </h1>
          <p>
            Get access to all the publications <br />
            <span>for {product.amount}</span>
          </p>
          <SubscribeButton />
        </section>

        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  );
}

/**
 * cenário atual: obter o preço do nosso produto na conta do Stripe para
 * exibi-lo de forma de dinamica.
 *
 * poderiamos realizar uma chamada no useEffect, porém a requisição seria
 * feita a partir da camada do client, ou seja, há a possibilidade de
 * um shift design do preço, uma vez que a parte da página seria pré-carregada
 * enquanto o valor ainda não.
 *
 * seria mais conveniente fazer uso dessa camada de pré-carregamento (SSR),
 * e para isso podemos usar o método abaixo (com o exato nome), o qual será
 * chamada dentro de tal camada node do servidor Next. Isto também é bom para
 * indexação nos motores de busca.
 *
 * esse método é chamado apenas em paginas, então repassamos os
 * dados obtidos para os componentes.
 *
 * lembre-se que ao utiliza-lo, nada será exibido até finalizar a
 * requisição no servidor SSR do Next.
 *
 * os dados retornados podem ser acessados na propriedade `props`.
 */
/* export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const price = await stripe.prices.retrieve("price_1K2FItHz7GZUTFQOmnWajgVW", {
    expand: ["product"],
  });

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price.unit_amount / 100),
  };

  return {
    props: {
      product,
    },
  };
};*/

/**
 * alem das requisições Client e SSR, temos a SSG (Static Site Generation). Com
 * essa abordagem, diferente do SSR que faz o mesmo processo todas as vezes,
 * podemos definir/salvar uma página de forma estatica e então recarregar ela
 * após um determinado tempo (revalidate).
 *
 * esse processo salva o estado de uma página, não faz sentido usa-la em
 * locais com valores dinamicos.
 *
 * no exemplo de um post com comentarios, seria bom usar este método
 * para o conteudo, mas para os comentarios busca-los pelo Client
 * ao rolar até sua seção.
 */
export const getStaticProps: GetStaticProps = async () => {
  /**
   * buscamos o preço do produto a partir do id, então expandimos,
   * isto é, obtemos o restante dos dados vinculados ao produto, como
   * titulo.
   */
  const price = await stripe.prices.retrieve('price_1K2FItHz7GZUTFQOmnWajgVW', {
    expand: ['product'],
  });

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      /**
       * é mais fácil para nós lidarmos com preço em centavos no
       * banco, por exemplo 990, então convertemos para 9,90
       */
    }).format(price.unit_amount / 100),
  };

  return {
    props: {
      product,
    },
    revalidate: 60 * 60 * 24, // 24 horas
  };
};
