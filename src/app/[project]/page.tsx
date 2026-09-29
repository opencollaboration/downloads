import { ProjectDownloads } from '@/components/ProjectDownloads';
import { getLatestJarUrl, getMavenDownloads } from '@/lib/maven/client';
import { getProjectBySlug, projects } from '@/lib/projects/registry';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface ProjectPageProps {
  params: Promise<{ project: string }>;
}

/**
 * Next.js statically analyses route segment config, so this must be a literal
 * and cannot reference `MAVEN_REVALIDATE_SECONDS`. Keep the two in step.
 */
export const revalidate = 300;

/**
 * Only the configured project slugs are valid routes. Combined with
 * `dynamicParams = false`, anything else renders the 404 page.
 */
export function generateStaticParams() {
  return projects.map((project) => ({ project: project.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { project: slug } = await params;
  const project = getProjectBySlug(slug);

  return { title: project?.label ?? 'Not Found' };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { project: slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const versions = await getMavenDownloads(project);

  const latestJarUrl =
    versions.length === 1 && versions[0]
      ? getLatestJarUrl(project.groupId, project.artifactId, versions[0].version)
      : getLatestJarUrl(project.groupId, project.artifactId);

  return (
    <ProjectDownloads
      projectName={project.projectName}
      versions={versions}
      latestJarUrl={latestJarUrl}
    />
  );
}
