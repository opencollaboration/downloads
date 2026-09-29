import { buildLatestJarUrl } from '@/lib/maven/urls';
import { describe, expect, it } from 'vitest';

describe('buildLatestJarUrl', () => {
  it('uses Maven group path segments', () => {
    expect(buildLatestJarUrl('https://repo.example/latest', 'org.cloudburstmc', 'server')).toBe(
      'https://repo.example/latest/org/cloudburstmc/server?extension=jar',
    );
  });

  it('includes a requested version', () => {
    expect(buildLatestJarUrl('https://repo.example/latest', 'cn.nukkit', 'nukkit', '2.0')).toBe(
      'https://repo.example/latest/cn/nukkit/nukkit/2.0?extension=jar',
    );
  });

  it('omits an empty version', () => {
    expect(buildLatestJarUrl('https://repo.example/latest', 'cn.nukkit', 'nukkit', '')).toBe(
      'https://repo.example/latest/cn/nukkit/nukkit?extension=jar',
    );
  });
});
