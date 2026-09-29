import 'server-only';

import { mapWithConcurrency } from '@/lib/concurrency';
import {
  createArtifactMatchers,
  isVersionListed,
  parseSnapshotTimestamp,
} from '@/lib/maven/artifacts';
import { parseProperties } from '@/lib/maven/properties';
import type {
  MavenArtifact,
  MavenDetailsResponse,
  MavenQuery,
  MavenVersion,
  MavenVersionsResponse,
  ResolvedVersion,
} from '@/lib/maven/types';
import { buildLatestJarUrl } from '@/lib/maven/urls';

/**
 * Listing an artifact is chatty, taking one request per version plus one per
 * build properties file, routinely 30 to 60 per page. Running it on the server
 * lets Next.js cache each response, so the work happens about once per
 * revalidation window and is shared by all visitors.
 */

const REPO_URL = 'https://repo.opencollab.dev';
const REPOSITORY = 'maven-snapshots';

const MAVEN_VERSIONS = `${REPO_URL}/api/maven/versions/${REPOSITORY}`;
const MAVEN_DETAILS = `${REPO_URL}/api/maven/details/${REPOSITORY}`;
const MAVEN_DOWNLOADS = `${REPO_URL}/${REPOSITORY}`;
const MAVEN_LATEST = `${REPO_URL}/api/maven/latest/file/${REPOSITORY}`;

/**
 * How long a version listing stays fresh. New snapshot builds appear
 * continuously, so this trades a little staleness for a large reduction in
 * upstream load.
 */
export const MAVEN_REVALIDATE_SECONDS = 300;

/**
 * Give up on an individual upstream request rather than letting it hang.
 *
 * Without this, one stalled request blocks the whole listing indefinitely,
 * which fails the build and stalls revalidation at runtime.
 */
const REQUEST_TIMEOUT_MS = 15_000;

/**
 * Cap how many requests are in flight at once.
 *
 * A single version can hold well over a hundred builds. Requesting all their
 * properties simultaneously is hard on the repository and unreliable in
 * practice, so the listing is fetched through a small pool instead.
 */
const MAX_CONCURRENT_REQUESTS = 8;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    next: { revalidate: MAVEN_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`Maven request failed (${response.status} ${response.statusText}): ${url}`);
  }

  return (await response.json()) as T;
}

/**
 * A timestamped snapshot build is immutable once published, so this is cached
 * indefinitely rather than on the shorter listing interval. Failure is
 * non-fatal: the build stays downloadable, it just renders without commit
 * metadata.
 */
async function fetchProperties(url: string): Promise<Record<string, string>> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'force-cache',
    });

    if (!response.ok) {
      return {};
    }

    return parseProperties(await response.text());
  } catch {
    return {};
  }
}

async function resolveVersion(
  artifactId: string,
  path: string,
  version: string,
): Promise<ResolvedVersion | null> {
  const details = await fetchJson<MavenDetailsResponse>(`${MAVEN_DETAILS}/${path}/${version}`);
  const files = (details.files ?? [])
    .map((file) => file.name)
    .filter((name): name is string => typeof name === 'string');

  const matchers = createArtifactMatchers(artifactId, version);
  const builds = new Map<string, MavenArtifact>();

  // Collect the JARs before the properties, so a properties file listed ahead
  // of its JAR is still applied.
  for (const name of files) {
    const match = matchers.jar.exec(name);
    if (!match) {
      continue;
    }

    const fileName = match[1];
    const stamp = match[2];
    const build = match[3];
    if (fileName === undefined || build === undefined) {
      continue;
    }

    builds.set(build, {
      build,
      name: fileName,
      downloadUrl: `${MAVEN_DOWNLOADS}/${path}/${version}/${fileName}`,
      publishedAt: stamp ? parseSnapshotTimestamp(stamp) : null,
      properties: {},
    });
  }

  if (builds.size === 0) {
    return null;
  }

  // Second pass: collect properties for the builds we kept.
  const propertyFiles = files.flatMap((name) => {
    const match = matchers.properties.exec(name);
    if (!match) {
      return [];
    }

    const fileName = match[1];
    const build = match[3];
    const artifact = build === undefined ? undefined : builds.get(build);
    if (fileName === undefined || artifact === undefined) {
      return [];
    }

    return [{ artifact, url: `${MAVEN_DOWNLOADS}/${path}/${version}/${fileName}` }];
  });

  // Newest build first.
  return { version: { version, artifacts: [...builds.values()].reverse() }, propertyFiles };
}

/**
 * List every published version of an artifact, newest first, with its builds.
 */
export async function getMavenDownloads(project: MavenQuery): Promise<MavenVersion[]> {
  const path = `${project.groupId.replace(/\./g, '/')}/${project.artifactId}`;
  const ignoredVersions = new Set(project.ignoredVersions ?? []);
  const acceptedVersions = new Set(project.acceptedVersions ?? []);

  const versionData = await fetchJson<MavenVersionsResponse>(`${MAVEN_VERSIONS}/${path}`);
  const candidates = (versionData.versions ?? []).filter((version) =>
    isVersionListed(version, ignoredVersions, acceptedVersions),
  );

  // Version details and properties use separate bounded passes, so the total
  // number of repository requests never exceeds the limit.
  const resolved = await mapWithConcurrency(candidates, MAX_CONCURRENT_REQUESTS, (version) =>
    resolveVersion(project.artifactId, path, version),
  );

  const available = resolved.filter((entry): entry is ResolvedVersion => entry !== null);
  await mapWithConcurrency(
    available.flatMap((entry) => entry.propertyFiles),
    MAX_CONCURRENT_REQUESTS,
    async ({ artifact, url }) => {
      artifact.properties = await fetchProperties(url);
    },
  );

  return available.map((entry) => entry.version).reverse();
}

/** URL of the repository's "latest build" redirect for an artifact. */
export function getLatestJarUrl(groupId: string, artifactId: string, version?: string): string {
  return buildLatestJarUrl(MAVEN_LATEST, groupId, artifactId, version);
}
