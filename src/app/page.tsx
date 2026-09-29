import { LinkButton } from '@/components/LinkButton';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Content,
  Gallery,
  Label,
  PageSection,
  Title,
} from '@/components/ui/patternfly';
import { getLatestJarUrl } from '@/lib/maven/client';
import { navGroups } from '@/lib/projects/registry';

export default function HomePage() {
  return (
    <>
      <PageSection isWidthLimited>
        <Title headingLevel="h1" size="2xl">
          Open Collaboration Downloads
        </Title>
        <Content component="p">
          Development builds of Open Collaboration projects, published continuously from our Maven
          repository. Pick a project to browse its build history, or grab the latest JAR directly.
        </Content>
      </PageSection>

      {navGroups.map((group) => (
        <PageSection key={group.label} hasBodyWrapper={false} isWidthLimited>
          <Title headingLevel="h2" size="lg">
            {group.label}
          </Title>

          <Gallery hasGutter minWidths={{ default: '100%', md: '26rem' }}>
            {group.projects.map((project) => (
              <Card key={project.slug} isFullHeight>
                <CardTitle component="h3">{project.projectName}</CardTitle>

                <CardBody>
                  <Content component="p">
                    <Label isCompact>
                      {project.groupId}:{project.artifactId}
                    </Label>
                  </Content>
                </CardBody>

                <CardFooter>
                  <LinkButton href={`/${project.slug}`} variant="primary">
                    View builds
                  </LinkButton>{' '}
                  <Button
                    component="a"
                    href={getLatestJarUrl(project.groupId, project.artifactId)}
                    variant="secondary"
                  >
                    Latest JAR
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </Gallery>
        </PageSection>
      ))}
    </>
  );
}
