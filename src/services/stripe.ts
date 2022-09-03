import { version } from '../../package.json';
import Stripe from 'stripe';

/**
 * utilizaremos o Stripe para simular o pagamento de assinaturas do
 * nosso serviço.
 *
 * apesar de existir a url da api para requisições, iremos utilizar os métodos
 * providos da classe Stripe, facilitando nosso trabalho e tipando o retorno.
 *
 * no Next, podemos acessar as varáveis de `.env.local` como acessamos
 * normalmente as do arquivo `.env`.
 */
export const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2020-08-27',
  appInfo: {
    name: 'Ignews',
    version,
  },
});
