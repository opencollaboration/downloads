import { PaginatedBuilds } from '@/components/PaginatedBuilds';
import type { BuildView } from '@/lib/view/types';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigation = vi.hoisted(() => ({
  pathname: '/cloudburst',
  search: '',
  replace: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ replace: navigation.replace }),
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

const builds: BuildView[] = Array.from({ length: 45 }, (_, index) => ({
  build: String(index + 1),
  downloadUrl: `https://repo.example/${index + 1}.jar`,
  message: `Build ${index + 1}`,
  commitUrl: null,
  publishedAt: null,
}));

function visibleNumbers() {
  return within(screen.getByRole('list', { name: 'Cloudburst' }))
    .getAllByRole('listitem')
    .map((row) => row.querySelector('.oc-build__id')?.textContent);
}

beforeEach(() => {
  navigation.pathname = '/cloudburst';
  navigation.search = '';
  navigation.replace.mockReset();
});

describe('PaginatedBuilds', () => {
  it('shows the first twenty builds by default', () => {
    render(<PaginatedBuilds builds={builds} label="Cloudburst" />);
    expect(visibleNumbers()).toEqual(Array.from({ length: 20 }, (_, index) => `#${index + 1}`));
  });

  it('reads the page from the URL', () => {
    navigation.search = 'page=2';
    render(<PaginatedBuilds builds={builds} label="Cloudburst" />);
    expect(visibleNumbers()[0]).toBe('#21');
  });

  it('reads an allowed page size from the URL', () => {
    navigation.search = 'perPage=10&page=2';
    render(<PaginatedBuilds builds={builds} label="Cloudburst" />);
    expect(visibleNumbers()).toEqual(Array.from({ length: 10 }, (_, index) => `#${index + 11}`));
  });

  it('clamps a page beyond the end of the list', () => {
    navigation.search = 'page=99';
    render(<PaginatedBuilds builds={builds} label="Cloudburst" />);
    expect(visibleNumbers()).toEqual(['#41', '#42', '#43', '#44', '#45']);
  });

  it.each(['0', '-2', 'abc', '1.5'])('ignores invalid page %s', (value) => {
    navigation.search = `page=${value}`;
    render(<PaginatedBuilds builds={builds} label="Cloudburst" />);
    expect(visibleNumbers()[0]).toBe('#1');
  });

  it.each(['0', 'abc', '25'])('ignores unsupported page size %s', (value) => {
    navigation.search = `perPage=${value}`;
    render(<PaginatedBuilds builds={builds} label="Cloudburst" />);
    expect(visibleNumbers()).toHaveLength(20);
  });

  it('does not paginate a short list', () => {
    render(<PaginatedBuilds builds={builds.slice(0, 3)} label="Cloudburst" />);
    expect(
      screen.queryByRole('navigation', { name: 'Cloudburst builds pagination' }),
    ).not.toBeInTheDocument();
  });

  it('writes the next page without losing other query parameters', () => {
    navigation.search = 'filter=recent';
    render(<PaginatedBuilds builds={builds} label="Cloudburst" />);
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(navigation.replace).toHaveBeenCalledWith('/cloudburst?filter=recent&page=2', {
      scroll: false,
    });
  });

  it('removes the page key when returning to the first page', () => {
    navigation.search = 'page=2';
    render(<PaginatedBuilds builds={builds} label="Cloudburst" />);
    fireEvent.click(screen.getByRole('button', { name: 'Go to previous page' }));
    expect(navigation.replace).toHaveBeenCalledWith('/cloudburst', { scroll: false });
  });

  it('writes a selected page size to the URL', () => {
    render(<PaginatedBuilds builds={builds} label="Cloudburst" />);
    fireEvent.click(screen.getByRole('button', { name: '1 - 20 of 45 builds' }));
    fireEvent.click(screen.getByRole('menuitem', { name: '10 per page' }));
    expect(navigation.replace).toHaveBeenCalledWith('/cloudburst?perPage=10', { scroll: false });
  });

  it('removes the default page size without changing unrelated parameters', () => {
    navigation.search = 'perPage=10&filter=recent';
    render(<PaginatedBuilds builds={builds} label="Cloudburst" />);
    fireEvent.click(screen.getByRole('button', { name: '1 - 10 of 45 builds' }));
    fireEvent.click(screen.getByRole('menuitem', { name: '20 per page' }));
    expect(navigation.replace).toHaveBeenCalledWith('/cloudburst?filter=recent', { scroll: false });
  });

  it('uses version-scoped query keys', () => {
    navigation.search = '1.0-page=2&2.0-page=3';
    render(<PaginatedBuilds builds={builds} label="Cloudburst" paramPrefix="1.0" />);
    fireEvent.click(screen.getByRole('button', { name: 'Go to previous page' }));
    expect(navigation.replace).toHaveBeenCalledWith('/cloudburst?2.0-page=3', { scroll: false });
  });
});
