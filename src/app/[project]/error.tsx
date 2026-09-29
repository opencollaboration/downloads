'use client';

import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  PageSection,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

/**
 * Reached when the Maven repository is unreachable. Without this the framework
 * renders a bare error page with no way back.
 */
export default function ProjectError({ reset }: { error: Error; reset: () => void }) {
  return (
    <PageSection hasBodyWrapper={false}>
      <EmptyState
        titleText="Builds are unavailable"
        variant="full"
        icon={ExclamationCircleIcon}
        status="danger"
      >
        <EmptyStateBody>
          The download list could not be loaded. The Maven repository may be temporarily
          unavailable.
        </EmptyStateBody>
        <EmptyStateFooter>
          <Button onClick={reset}>Try again</Button>
        </EmptyStateFooter>
      </EmptyState>
    </PageSection>
  );
}
