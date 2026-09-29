import { getLatestJarUrl, getMavenDownloads, MAVEN_REVALIDATE_SECONDS } from '@/lib/maven/client';
import type { MavenQuery } from '@/lib/maven/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const repository = 'https://repo.opencollab.dev';
const base = `${repository}/maven-snapshots/org/example/server`;
const versionsUrl = `${repository}/api/maven/versions/maven-snapshots/org/example/server`;
const detailsUrl = `${repository}/api/maven/details/maven-snapshots/org/example/server`;
const project: MavenQuery = { groupId: 'org.example', artifactId: 'server' };

function jar(version: string, build: number, stamp = '20260919.123832') {
  return `server-${version.replace(/-SNAPSHOT$/, '')}-${stamp}-${build}.jar`;
}

function properties(version: string, build: number, stamp = '20260919.123832') {
  return jar(version, build, stamp).replace(/\.jar$/, '.properties');
}

function response(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Unavailable',
    json: async () => body,
    text: async () => String(body),
  } as Response;
}

function repositoryFetch(
  versions: string[],
  files: Record<string, string[]>,
  texts: Record<string, string> = {},
) {
  const fetchMock = vi.fn(async (input: string, _init?: RequestInit): Promise<Response> => {
    if (input === versionsUrl) return response({ versions });
    for (const version of versions) {
      if (input === `${detailsUrl}/${version}`) {
        return response({ files: (files[version] ?? []).map((name) => ({ name })) });
      }
    }
    const file = input.slice(input.lastIndexOf('/') + 1);
    return response(texts[file] ?? 'git.commit.message.short=Updated');
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getMavenDownloads', () => {
  it('returns no versions for an empty repository', async () => {
    repositoryFetch([], {});
    expect(await getMavenDownloads(project)).toEqual([]);
  });

  it('returns versions newest first', async () => {
    repositoryFetch(['1.0-SNAPSHOT', '2.0-SNAPSHOT'], {
      '1.0-SNAPSHOT': [jar('1.0-SNAPSHOT', 1)],
      '2.0-SNAPSHOT': [jar('2.0-SNAPSHOT', 1)],
    });
    expect((await getMavenDownloads(project)).map((version) => version.version)).toEqual([
      '2.0-SNAPSHOT',
      '1.0-SNAPSHOT',
    ]);
  });

  it('returns builds newest first', async () => {
    repositoryFetch(['1.0-SNAPSHOT'], {
      '1.0-SNAPSHOT': [jar('1.0-SNAPSHOT', 1), jar('1.0-SNAPSHOT', 2)],
    });
    expect(
      (await getMavenDownloads(project))[0]?.artifacts.map((artifact) => artifact.build),
    ).toEqual(['2', '1']);
  });

  it('skips an ignored version', async () => {
    const fetchMock = repositoryFetch(['1.0-SNAPSHOT', '2.0-SNAPSHOT'], {
      '2.0-SNAPSHOT': [jar('2.0-SNAPSHOT', 1)],
    });
    expect(
      (await getMavenDownloads({ ...project, ignoredVersions: ['1.0-SNAPSHOT'] })).map(
        (version) => version.version,
      ),
    ).toEqual(['2.0-SNAPSHOT']);
    expect(fetchMock.mock.calls.some(([url]) => url === `${detailsUrl}/1.0-SNAPSHOT`)).toBe(false);
  });

  it('only loads versions matching an accepted pattern', async () => {
    repositoryFetch(['SERVER-1', 'proxy-1'], { 'proxy-1': [jar('proxy-1', 1)] });
    expect(
      (await getMavenDownloads({ ...project, acceptedVersions: ['PROXY-.*'] })).map(
        (version) => version.version,
      ),
    ).toEqual(['proxy-1']);
  });

  it('skips a version without a matching jar', async () => {
    repositoryFetch(['1.0-SNAPSHOT', '2.0-SNAPSHOT'], {
      '1.0-SNAPSHOT': ['source.zip', properties('1.0-SNAPSHOT', 1)],
      '2.0-SNAPSHOT': [jar('2.0-SNAPSHOT', 2)],
    });
    expect((await getMavenDownloads(project)).map((version) => version.version)).toEqual([
      '2.0-SNAPSHOT',
    ]);
  });

  it('ignores malformed entries in a version listing', async () => {
    const fetchMock = vi.fn(async (url: string) =>
      response(
        url === versionsUrl ? { versions: ['1.0-SNAPSHOT'] } : { files: [{}, { name: 12 }] },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    expect(await getMavenDownloads(project)).toEqual([]);
  });

  it('derives the download URL from the published filename', async () => {
    repositoryFetch(['1.0-SNAPSHOT'], { '1.0-SNAPSHOT': [jar('1.0-SNAPSHOT', 7)] });
    expect((await getMavenDownloads(project))[0]?.artifacts[0]?.downloadUrl).toBe(
      `${base}/1.0-SNAPSHOT/${jar('1.0-SNAPSHOT', 7)}`,
    );
  });

  it('derives the publication time from the filename', async () => {
    repositoryFetch(['1.0-SNAPSHOT'], { '1.0-SNAPSHOT': [jar('1.0-SNAPSHOT', 7)] });
    expect((await getMavenDownloads(project))[0]?.artifacts[0]?.publishedAt).toBe(
      '2026-09-19T12:38:32Z',
    );
  });

  it('attaches properties when their file is listed ahead of the jar', async () => {
    const version = '1.0-SNAPSHOT';
    repositoryFetch(
      [version],
      { [version]: [properties(version, 7), jar(version, 7)] },
      {
        [properties(version, 7)]: String.raw`git.commit.message.short=feat\: thing (\#180)`,
      },
    );
    expect((await getMavenDownloads(project))[0]?.artifacts[0]?.properties).toEqual({
      'git.commit.message.short': 'feat: thing (#180)',
    });
  });

  it('ignores properties without a matching jar', async () => {
    const version = '1.0-SNAPSHOT';
    const fetchMock = repositoryFetch([version], {
      [version]: [properties(version, 8), jar(version, 7)],
    });
    await getMavenDownloads(project);
    expect(fetchMock.mock.calls.some(([url]) => url.endsWith(properties(version, 8)))).toBe(false);
  });

  it('keeps a build when its properties request fails', async () => {
    const version = '1.0-SNAPSHOT';
    const fetchMock = repositoryFetch([version], {
      [version]: [jar(version, 7), properties(version, 7)],
    });
    fetchMock.mockImplementationOnce(async () => response({ versions: [version] }));
    fetchMock.mockImplementationOnce(async () =>
      response({ files: [{ name: jar(version, 7) }, { name: properties(version, 7) }] }),
    );
    fetchMock.mockImplementationOnce(async () => response('', 503));
    expect((await getMavenDownloads(project))[0]?.artifacts[0]?.properties).toEqual({});
  });

  it('keeps a build when its properties request throws', async () => {
    const version = '1.0-SNAPSHOT';
    const fetchMock = repositoryFetch([version], {
      [version]: [jar(version, 7), properties(version, 7)],
    });
    fetchMock.mockImplementationOnce(async () => response({ versions: [version] }));
    fetchMock.mockImplementationOnce(async () =>
      response({ files: [{ name: jar(version, 7) }, { name: properties(version, 7) }] }),
    );
    fetchMock.mockImplementationOnce(async () => {
      throw new Error('offline');
    });
    expect((await getMavenDownloads(project))[0]?.artifacts[0]?.properties).toEqual({});
  });

  it('throws when the version listing fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => response('', 503)),
    );
    await expect(getMavenDownloads(project)).rejects.toThrow('Maven request failed (503');
  });

  it('throws when a version detail request fails', async () => {
    const fetchMock = repositoryFetch(['1.0-SNAPSHOT'], {});
    fetchMock.mockImplementationOnce(async () => response({ versions: ['1.0-SNAPSHOT'] }));
    fetchMock.mockImplementationOnce(async () => response('', 503));
    await expect(getMavenDownloads(project)).rejects.toThrow('Maven request failed (503');
  });

  it('sets an abort signal on every request', async () => {
    const version = '1.0-SNAPSHOT';
    const fetchMock = repositoryFetch([version], {
      [version]: [jar(version, 7), properties(version, 7)],
    });
    await getMavenDownloads(project);
    expect(
      fetchMock.mock.calls.every(([, options]) => options?.signal instanceof AbortSignal),
    ).toBe(true);
  });

  it('uses revalidation for listings and immutable caching for properties', async () => {
    const version = '1.0-SNAPSHOT';
    const fetchMock = repositoryFetch([version], {
      [version]: [jar(version, 7), properties(version, 7)],
    });
    await getMavenDownloads(project);
    expect(
      fetchMock.mock.calls.map(([, options]) => options?.cache ?? options?.next?.revalidate),
    ).toEqual([MAVEN_REVALIDATE_SECONDS, MAVEN_REVALIDATE_SECONDS, 'force-cache']);
  });

  it('keeps repository requests under the concurrency ceiling across versions', async () => {
    const versions = ['1.0-SNAPSHOT', '2.0-SNAPSHOT'];
    const files = Object.fromEntries(
      versions.map((version) => [
        version,
        Array.from({ length: 12 }, (_, index) => [
          jar(version, index),
          properties(version, index),
        ]).flat(),
      ]),
    );
    let inFlight = 0;
    let peak = 0;
    const fetchMock = repositoryFetch(versions, files);
    const serve = fetchMock.getMockImplementation();
    fetchMock.mockImplementation(async (url, options) => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 1));
      try {
        return await serve!(url, options);
      } finally {
        inFlight--;
      }
    });
    await getMavenDownloads(project);
    expect(peak).toBeLessThanOrEqual(8);
  });
});

describe('getLatestJarUrl', () => {
  it('builds a project-wide latest link', () => {
    expect(getLatestJarUrl('org.example', 'server')).toBe(
      `${repository}/api/maven/latest/file/maven-snapshots/org/example/server?extension=jar`,
    );
  });

  it('builds a version-specific latest link', () => {
    expect(getLatestJarUrl('org.example', 'server', '1.0-SNAPSHOT')).toBe(
      `${repository}/api/maven/latest/file/maven-snapshots/org/example/server/1.0-SNAPSHOT?extension=jar`,
    );
  });
});
