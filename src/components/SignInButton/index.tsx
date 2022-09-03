import { useSession, signIn, signOut } from 'next-auth/react';
import { FaGithub } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

import styles from './styles.module.scss';

export default function SignInButton() {
  /**
   * we can access the persisted session through the
   * useSession hook.
   */
  const { data: session } = useSession();

  return session ? (
    <button type="button" className={styles.signInButton}>
      <FaGithub color="#04d361" />
      {session.user.name}
      <FiX
        color="#7372380"
        className={styles.closeIcon}
        /**
         * signs out the current user
         */
        onClick={() => signOut()}
      />
    </button>
  ) : (
    <button
      type="button"
      className={styles.signInButton}
      /**
       * signs is the user through the configured
       * specified and previously configured provider.
       */
      onClick={() => signIn('github')}
    >
      <FaGithub color="#eba417" />
      Sign in with your GitHub
    </button>
  );
}
