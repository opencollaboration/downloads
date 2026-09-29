'use client';

import type { ButtonProps } from '@patternfly/react-core';
import { Button } from '@patternfly/react-core';
import Link from 'next/link';

interface LinkButtonProps extends Omit<ButtonProps, 'component' | 'href'> {
  href: string;
  children: React.ReactNode;
}

/**
 * `next/link` has to be handed to `Button` as the rendered component, and a
 * component reference cannot cross the server/client boundary as a prop, so
 * the pairing is made here inside the client boundary.
 */
export function LinkButton({ href, children, ...props }: LinkButtonProps) {
  return (
    <Button component={Link} href={href} {...props}>
      {children}
    </Button>
  );
}
