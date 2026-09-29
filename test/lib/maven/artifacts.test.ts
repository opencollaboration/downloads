import {
  createArtifactMatchers,
  isVersionListed,
  parseSnapshotTimestamp,
} from '@/lib/maven/artifacts';
import { describe, expect, it } from 'vitest';

describe('createArtifactMatchers', () => {
  const matchers = createArtifactMatchers('cloudburst.server', '1.0-SNAPSHOT');

  it('matches a timestamped jar and captures its build', () => {
    expect(matchers.jar.exec('cloudburst.server-1.0-20260919.123832-1250.jar')?.[3]).toBe('1250');
  });

  it('matches a sibling properties file', () => {
    expect(
      matchers.properties.exec('cloudburst.server-1.0-20260919.123832-1250.properties')?.[3],
    ).toBe('1250');
  });

  it('does not interpret artifact punctuation as regular expressions', () => {
    expect(matchers.jar.test('cloudburstXserver-1.0-20260919.123832-1250.jar')).toBe(false);
  });

  it('rejects an unrelated version', () => {
    expect(matchers.jar.test('cloudburst.server-2.0-20260919.123832-1250.jar')).toBe(false);
  });

  it('rejects untimestamped jars', () => {
    expect(matchers.jar.test('cloudburst.server-1.0.jar')).toBe(false);
  });
});

describe('isVersionListed', () => {
  it('accepts versions with no filters', () => {
    expect(isVersionListed('1.0', new Set(), new Set())).toBe(true);
  });

  it('excludes an exact ignored version', () => {
    expect(isVersionListed('1.0', new Set(['1.0']), new Set())).toBe(false);
  });

  it('does not exclude a partial ignore match', () => {
    expect(isVersionListed('1.0-SNAPSHOT', new Set(['1.0']), new Set())).toBe(true);
  });

  it('matches accepted patterns without case sensitivity', () => {
    expect(isVersionListed('PROXY-1.0', new Set(), new Set(['proxy-.*']))).toBe(true);
  });

  it('accepts a match from a later pattern', () => {
    expect(isVersionListed('velocity-1.0', new Set(), new Set(['bungee-.*', 'velocity-.*']))).toBe(
      true,
    );
  });

  it('rejects versions outside the accepted patterns', () => {
    expect(isVersionListed('server-1.0', new Set(), new Set(['proxy-.*']))).toBe(false);
  });

  it('applies the ignore list even when a version is accepted', () => {
    expect(isVersionListed('proxy-1.0', new Set(['proxy-1.0']), new Set(['proxy-.*']))).toBe(false);
  });
});

describe('parseSnapshotTimestamp', () => {
  it('converts a snapshot timestamp to UTC', () => {
    expect(parseSnapshotTimestamp('20260919.123832')).toBe('2026-09-19T12:38:32Z');
  });

  it('rejects malformed snapshot timestamps', () => {
    expect(parseSnapshotTimestamp('2026-09-19')).toBeNull();
  });

  it('rejects an impossible month', () => {
    expect(parseSnapshotTimestamp('20261319.123832')).toBeNull();
  });
});
