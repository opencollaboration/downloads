import ProjectPage, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
  revalidate,
} from '@/app/[project]/page';
import { getLatestJarUrl, getMavenDownloads } from '@/lib/maven/client';
import type { MavenVersion } from '@/lib/maven/types';
import { projects } from '@/lib/projects/registry';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigation = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error('not found');
  }),
}));

vi.mock('next/navigation', () => ({ notFound: navigation.notFound }));
vi.mock('@/lib/maven/client', () => ({ getMavenDownloads: vi.fn(), getLatestJarUrl: vi.fn() }));

const version: MavenVersion = { version: '1.0-SNAPSHOT', artifacts: [] };
const params = (project: string) => ({ params: Promise.resolve({ project }) });

beforeEach(() => {
  vi.mocked(getMavenDownloads).mockReset();
  vi.mocked(getLatestJarUrl).mockReset();
  navigation.notFound.mockClear();
  vi.mocked(getLatestJarUrl).mockImplementation(
    (groupId, artifactId, selectedVersion) =>
      `${groupId}/${artifactId}/${selectedVersion ?? 'all'}`,
  );
});

describe('project route', () => {
  it('generates paths for every configured project', () => {
    expect(generateStaticParams()).toEqual(projects.map((project) => ({ project: project.slug })));
  });

  it('disallows unconfigured dynamic paths', () => {
    expect(dynamicParams).toBe(false);
  });

  it('revalidates published builds after five minutes', () => {
    expect(revalidate).toBe(300);
  });

  it('uses the configured project label for metadata', async () => {
    expect(await generateMetadata(params('cloudburst'))).toEqual({ title: 'Cloudburst' });
  });

  it('uses a not found title for an unknown project', async () => {
    expect(await generateMetadata(params('unknown'))).toEqual({ title: 'Not Found' });
  });

  it('rejects an unknown project before fetching builds', async () => {
    await expect(ProjectPage(params('unknown'))).rejects.toThrow('not found');
    expect(getMavenDownloads).not.toHaveBeenCalled();
  });

  it('fetches builds for the selected project', async () => {
    vi.mocked(getMavenDownloads).mockResolvedValue([]);
    await ProjectPage(params('cloudburst'));
    expect(getMavenDownloads).toHaveBeenCalledWith(projects[0]);
  });

  it('passes the project name to the downloads view', async () => {
    vi.mocked(getMavenDownloads).mockResolvedValue([]);
    const element = await ProjectPage(params('cloudburst'));
    expect(element.props.projectName).toBe('Cloudburst');
  });

  it('selects the version-specific latest link for one version', async () => {
    vi.mocked(getMavenDownloads).mockResolvedValue([version]);
    const element = await ProjectPage(params('cloudburst'));
    expect(element.props.latestJarUrl).toBe('org.cloudburstmc/cloudburst-server/1.0-SNAPSHOT');
  });

  it('selects the project-wide latest link for several versions', async () => {
    vi.mocked(getMavenDownloads).mockResolvedValue([
      version,
      { ...version, version: '2.0-SNAPSHOT' },
    ]);
    const element = await ProjectPage(params('cloudburst'));
    expect(element.props.latestJarUrl).toBe('org.cloudburstmc/cloudburst-server/all');
  });

  it('selects the project-wide latest link when no versions exist', async () => {
    vi.mocked(getMavenDownloads).mockResolvedValue([]);
    const element = await ProjectPage(params('cloudburst'));
    expect(element.props.latestJarUrl).toBe('org.cloudburstmc/cloudburst-server/all');
  });

  it('passes the fetched versions through to the downloads view', async () => {
    vi.mocked(getMavenDownloads).mockResolvedValue([version]);
    const element = await ProjectPage(params('cloudburst'));
    expect(element.props.versions).toEqual([version]);
  });
});
