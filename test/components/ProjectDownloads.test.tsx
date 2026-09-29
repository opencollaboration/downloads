import { ProjectDownloads } from '@/components/ProjectDownloads';
import type { MavenVersion } from '@/lib/maven/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/cloudburst',
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const one: MavenVersion = {
  version: '1.0-SNAPSHOT',
  artifacts: [
    {
      build: '7',
      name: 'server-7.jar',
      downloadUrl: 'https://repo.example/server-7.jar',
      publishedAt: null,
      properties: {},
    },
  ],
};

describe('ProjectDownloads', () => {
  it('shows one project heading when no builds exist', () => {
    render(<ProjectDownloads projectName="Cloudburst" versions={[]} latestJarUrl="/latest" />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('explains when no builds are available', () => {
    render(<ProjectDownloads projectName="Cloudburst" versions={[]} latestJarUrl="/latest" />);
    expect(
      screen.getByText('No builds are currently available for this project.'),
    ).toBeInTheDocument();
  });

  it('does not show a latest build link with no versions', () => {
    render(<ProjectDownloads projectName="Cloudburst" versions={[]} latestJarUrl="/latest" />);
    expect(screen.queryByRole('link', { name: 'here' })).not.toBeInTheDocument();
  });

  it('links the latest build when versions exist', () => {
    render(<ProjectDownloads projectName="Cloudburst" versions={[one]} latestJarUrl="/latest" />);
    expect(screen.getByRole('link', { name: 'here' })).toHaveAttribute('href', '/latest');
  });

  it('omits a per-version heading for one version', () => {
    render(<ProjectDownloads projectName="Cloudburst" versions={[one]} latestJarUrl="/latest" />);
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('shows a heading for each version when several exist', () => {
    render(
      <ProjectDownloads
        projectName="Cloudburst"
        versions={[one, { ...one, version: '2.0-SNAPSHOT' }]}
        latestJarUrl="/latest"
      />,
    );
    expect(
      screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent),
    ).toEqual(['1.0-SNAPSHOT', '2.0-SNAPSHOT']);
  });

  it('keeps exactly one primary heading with several versions', () => {
    render(
      <ProjectDownloads
        projectName="Cloudburst"
        versions={[one, { ...one, version: '2.0-SNAPSHOT' }]}
        latestJarUrl="/latest"
      />,
    );
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});
