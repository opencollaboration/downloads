'use client';

import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  PageSection,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { useRouter } from 'next/navigation';

/**
 * Client component: the empty state receives `ExclamationTriangleIcon` as a
 * component reference, which is not serialisable across the server/client
 * boundary, and the button navigates imperatively.
 */
export function NotFoundContent() {
  const router = useRouter();

  return (
    <PageSection hasBodyWrapper={false}>
      <EmptyState titleText="404 Page not found" variant="full" icon={ExclamationTriangleIcon}>
        <EmptyStateBody>
          We didn&apos;t find a page that matches the address you navigated to.
        </EmptyStateBody>
        <EmptyStateFooter>
          <Button onClick={() => router.push('/')}>Take me home</Button>
        </EmptyStateFooter>
      </EmptyState>
    </PageSection>
  );
}
