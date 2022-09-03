/**
 * Link allows us to maintain the SPA functionality
 * from React and fetch/render what is needed.
 *
 * it as has a cool option - prefetch, that loads
 * the content from the assigned route.
 */
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';
import { cloneElement, ReactElement } from 'react';

interface ActiveLinkProps extends LinkProps {
  children: ReactElement;
  activeClassName: string;
}

export function ActiveLink({
  children,
  activeClassName,
  ...rest
}: ActiveLinkProps) {
  /**
   * asPath has the current path
   */
  const { asPath } = useRouter();
  const className = asPath === rest.href ? activeClassName : '';

  /**
   * although we cannot pass classes nor any other
   * attribute to the coming children element,
   * we can clone it and insert the desire configuration
   */
  return <Link {...rest}>{cloneElement(children, { className })}</Link>;
}
