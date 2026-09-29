import { getProjectBySlug, navGroups, projects } from '@/lib/projects/registry';
import { describe, expect, it } from 'vitest';

describe('project registry', () => {
  it('finds a configured project by slug', () => {
    expect(getProjectBySlug('cloudburst')?.artifactId).toBe('cloudburst-server');
  });

  it('returns no project for an unknown slug', () => {
    expect(getProjectBySlug('missing')).toBeUndefined();
  });

  it('exposes every grouped project in the flat registry', () => {
    expect(projects.map((project) => project.slug)).toEqual(
      navGroups.flatMap((group) => group.projects.map((project) => project.slug)),
    );
  });
});
