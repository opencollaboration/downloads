/**
 * Imported by both Server Components (to fetch artifacts) and Client
 * Components (to render navigation), so this must stay free of server-only
 * imports and hold plain, serialisable data only.
 */

import type { MavenProject, NavGroup } from '@/lib/projects/types';

export const HOME_NAV = {
  href: '/',
  label: 'Home',
} as const;

export const navGroups: NavGroup[] = [
  {
    label: 'CloudburstMC',
    projects: [
      {
        slug: 'cloudburst',
        label: 'Cloudburst',
        projectName: 'Cloudburst',
        groupId: 'org.cloudburstmc',
        artifactId: 'cloudburst-server',
        ignoredVersions: ['0.0.1-SNAPSHOT', '1.0.0-SNAPSHOT'],
      },
      {
        slug: 'nukkit',
        label: 'Nukkit',
        projectName: 'Nukkit',
        groupId: 'cn.nukkit',
        artifactId: 'nukkit',
        ignoredVersions: ['2.0.0-SNAPSHOT'],
      },
    ],
  },
  {
    label: 'GeyserMC',
    projects: [
      {
        slug: 'floodgate-bungee-proxy',
        label: 'Floodgate Bungee Proxy',
        projectName: 'Floodgate Bungee Proxy',
        groupId: 'org.geysermc.floodgate',
        artifactId: 'bungee',
        acceptedVersions: ['proxy-.*'],
      },
      {
        slug: 'floodgate-velocity-proxy',
        label: 'Floodgate Velocity Proxy',
        projectName: 'Floodgate Velocity Proxy',
        groupId: 'org.geysermc.floodgate',
        artifactId: 'velocity',
        acceptedVersions: ['proxy-.*'],
      },
    ],
  },
];

export const projects: MavenProject[] = navGroups.flatMap((group) => group.projects);

export function getProjectBySlug(slug: string): MavenProject | undefined {
  return projects.find((project) => project.slug === slug);
}
