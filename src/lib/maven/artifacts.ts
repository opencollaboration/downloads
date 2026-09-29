import type { ArtifactMatchers } from '@/lib/maven/types';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build matchers for a version's timestamped snapshot files, e.g.
 * `nukkit-1.0-20240102.030405-7.jar` and its sibling `.properties`.
 *
 * Capture groups: 1 = full filename, 2 = timestamp, 3 = build number.
 */
export function createArtifactMatchers(artifactId: string, version: string): ArtifactMatchers {
  const versionWithoutSnapshot = version.replace(/-SNAPSHOT$/, '');
  const stem = `${escapeRegExp(artifactId)}-${escapeRegExp(versionWithoutSnapshot)}`;
  const suffix = String.raw`-([0-9]{8}\.[0-9]{6})-([0-9]+)`;

  return {
    jar: new RegExp(`^(${stem}${suffix}\\.jar)$`),
    properties: new RegExp(`^(${stem}${suffix}\\.properties)$`),
  };
}

/**
 * `ignoredVersions` is an exact-match denylist. `acceptedVersions`, when
 * non-empty, is a case-insensitive regular expression allowlist.
 */
export function isVersionListed(
  version: string,
  ignoredVersions: ReadonlySet<string>,
  acceptedVersions: ReadonlySet<string>,
): boolean {
  if (ignoredVersions.has(version)) {
    return false;
  }

  if (acceptedVersions.size === 0) {
    return true;
  }

  for (const pattern of acceptedVersions) {
    if (new RegExp(pattern, 'i').test(version)) {
      return true;
    }
  }

  return false;
}

/**
 * Convert a Maven snapshot timestamp into an ISO 8601 instant.
 *
 * Snapshot filenames embed the publication time as `YYYYMMDD.HHMMSS` in UTC,
 * for example `nukkit-1.0-20260919.123832-1250.jar`. This is more reliable
 * than the `git.commit.time` property, which is a preformatted local string
 * and is not present for every build.
 */
export function parseSnapshotTimestamp(stamp: string): string | null {
  const match = /^(\d{4})(\d{2})(\d{2})\.(\d{2})(\d{2})(\d{2})$/.exec(stamp);
  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second] = match;
  const iso = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;

  // Guard against impossible dates such as month 13.
  return Number.isNaN(Date.parse(iso)) ? null : iso;
}
