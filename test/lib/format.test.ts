import { formatBuildTime } from '@/lib/format';
import { describe, expect, it, vi } from 'vitest';

describe('formatBuildTime', () => {
  it('renders the publication time in UTC', () => {
    expect(formatBuildTime('2026-09-19T12:38:32Z')).toBe('19 Sep 2026, 12:38 UTC');
  });

  it('pads a single-digit day and hour', () => {
    expect(formatBuildTime('2026-01-02T03:04:00Z')).toBe('02 Jan 2026, 03:04 UTC');
  });

  it('converts an offset time to the same UTC display', () => {
    expect(formatBuildTime('2026-09-19T13:38:32+01:00')).toBe('19 Sep 2026, 12:38 UTC');
  });

  it('does not use a locale-aware formatter', () => {
    const formatter = vi.spyOn(Intl, 'DateTimeFormat');
    expect(formatBuildTime('2026-09-19T12:38:32Z')).toBe('19 Sep 2026, 12:38 UTC');
    expect(formatter).not.toHaveBeenCalled();
    formatter.mockRestore();
  });
});
