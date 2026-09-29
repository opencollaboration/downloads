import { BuildsSection } from '@/components/BuildsSection';
import { Button, Content, PageSection, Title } from '@/components/ui/patternfly';
import type { MavenVersion } from '@/lib/maven/types';
import { toVersionView } from '@/lib/view/build-view';

interface ProjectDownloadsProps {
  projectName: string;
  versions: MavenVersion[];
  /** Pre-resolved "latest build" redirect, computed on the server. */
  latestJarUrl: string;
}

export function ProjectDownloads({ projectName, versions, latestJarUrl }: ProjectDownloadsProps) {
  if (versions.length === 0) {
    return (
      <PageSection isWidthLimited>
        <Title headingLevel="h1" size="2xl">
          {projectName}
        </Title>
        <Content component="p">No builds are currently available for this project.</Content>
      </PageSection>
    );
  }

  // A project with exactly one version needs no per-version headings.
  const isSingleVersion = versions.length === 1;

  return (
    <>
      {/*
        The heading comes first so the page leads with what it is, and so the
        call to action is not read out before its own heading.
      */}
      <PageSection isWidthLimited>
        <Title headingLevel="h1" size="2xl">
          {projectName}
        </Title>
        <Content component="p">
          Download the latest build{' '}
          <Button component="a" href={latestJarUrl} variant="link" isInline>
            here
          </Button>
          .
        </Content>
      </PageSection>

      {versions.map((version) => {
        const view = toVersionView(version);

        return (
          <PageSection key={view.version} hasBodyWrapper={false}>
            {/* Versions sit below the project heading, so they are h2. */}
            {!isSingleVersion && (
              <Title headingLevel="h2" size="lg">
                {view.version}
              </Title>
            )}
            <BuildsSection
              builds={view.builds}
              label={isSingleVersion ? projectName : `${projectName} ${view.version}`}
              // Each version pages independently, so they need distinct query
              // keys. A single version keeps the plain `?page=`.
              paramPrefix={isSingleVersion ? undefined : view.version}
            />
          </PageSection>
        );
      })}
    </>
  );
}
