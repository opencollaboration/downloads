import type { MavenArtifact } from '@/lib/maven/types';
import { toBuildView, toVersionView } from '@/lib/view/build-view';
import { describe, expect, it } from 'vitest';

const artifact: MavenArtifact = {
  build: '7',
  name: 'server-7.jar',
  downloadUrl: 'https://repo.example/server-7.jar',
  publishedAt: '2026-09-19T12:38:32Z',
  properties: {
    'git.commit.message.short': 'feat: new item',
    'git.commit.id': 'abc',
    'github.repo': 'example/repo',
  },
};

describe('toBuildView', () => {
  it('keeps the build number, download URL, and publication time', () => {
    expect(toBuildView(artifact)).toMatchObject({
      build: '7',
      downloadUrl: artifact.downloadUrl,
      publishedAt: artifact.publishedAt,
    });
  });

  it('exposes the commit message', () => {
    expect(toBuildView(artifact).message).toBe('feat: new item');
  });

  it('links the commit when both repository and ID exist', () => {
    expect(toBuildView(artifact).commitUrl).toBe('https://github.com/example/repo/commit/abc');
  });

  it('does not link a commit missing its repository', () => {
    expect(
      toBuildView({ ...artifact, properties: { 'git.commit.id': 'abc' } }).commitUrl,
    ).toBeNull();
  });

  it('does not link a commit missing its ID', () => {
    expect(
      toBuildView({ ...artifact, properties: { 'github.repo': 'example/repo' } }).commitUrl,
    ).toBeNull();
  });

  it('uses no message when commit metadata is absent', () => {
    expect(toBuildView({ ...artifact, properties: {} }).message).toBeNull();
  });
});

describe('toVersionView', () => {
  it('maps every artifact while retaining the version', () => {
    expect(
      toVersionView({ version: '1.0', artifacts: [artifact, { ...artifact, build: '8' }] }),
    ).toMatchObject({
      version: '1.0',
      builds: [{ build: '7' }, { build: '8' }],
    });
  });
});
