import type { MavenCoordinates } from '@/lib/maven/types';

export interface MavenProject extends MavenCoordinates {
  /** URL segment, e.g. `cloudburst` -> `/cloudburst`. */
  slug: string;
  /** Label shown in the sidebar navigation. */
  label: string;
  /** Human readable project name shown in page headings. */
  projectName: string;
  /** Exact version strings to drop from the listing. */
  ignoredVersions?: string[];
  /**
   * Case-insensitive regular expressions. When present, a version is only
   * listed if it matches at least one of them.
   */
  acceptedVersions?: string[];
}

export interface NavGroup {
  label: string;
  projects: MavenProject[];
}
