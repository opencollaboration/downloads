import { BuildsSection } from '@/components/BuildsSection';
import type { BuildView } from '@/lib/view/types';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/cloudburst',
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const builds: BuildView[] = Array.from({ length: 25 }, (_, index) => ({
  build: String(index + 1),
  downloadUrl: `https://repo.example/${index + 1}.jar`,
  message: null,
  commitUrl: null,
  publishedAt: null,
}));

describe('BuildsSection', () => {
  it('shows the first page of builds', () => {
    render(<BuildsSection builds={builds} label="Cloudburst" />);
    expect(
      within(screen.getByRole('list', { name: 'Cloudburst' })).getAllByRole('listitem'),
    ).toHaveLength(20);
  });

  it('omits pagination for a short list', () => {
    render(<BuildsSection builds={builds.slice(0, 2)} label="Cloudburst" />);
    expect(
      screen.queryByRole('navigation', { name: 'Cloudburst builds pagination' }),
    ).not.toBeInTheDocument();
  });

  it('labels the pagination for its build list', () => {
    render(<BuildsSection builds={builds} label="Cloudburst" />);
    expect(
      screen.getByRole('navigation', { name: 'Cloudburst builds pagination' }),
    ).toBeInTheDocument();
  });
});
