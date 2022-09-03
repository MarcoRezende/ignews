import { SessionProvider } from 'next-auth/react';
import { AppProps } from 'next/app';

import Header from '../components/Header';

import '../styles/global.scss';
/**
 * precisamos configurar o provider que fornecerá os dados para o
 * hook useSession do Next Auth
 */

/**
 * loads and display our entire page, re-rendering when its needed.
 */
function MyApp({ Component, pageProps }: AppProps) {
  return (
    /**
     * pageProps contém todas as informações persistidas
     * durante o reload.
     */
    <SessionProvider session={pageProps.session}>
      <Header />
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
