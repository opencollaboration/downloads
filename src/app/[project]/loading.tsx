import { PageSection, Skeleton, Title } from '@/components/ui/patternfly';

/**
 * Without this the previous page stays on screen with no feedback until the
 * new one is ready.
 */
export default function Loading() {
  return (
    <PageSection>
      <Title headingLevel="h1" size="2xl">
        <Skeleton width="30%" screenreaderText="Loading builds" />
      </Title>
      <Skeleton width="55%" />
    </PageSection>
  );
}
