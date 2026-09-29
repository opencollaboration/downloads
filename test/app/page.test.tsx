import HomePage from '@/app/page';
import { navGroups } from '@/lib/projects/registry';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('HomePage', () => {
  it('has one primary heading', () => {
    render(<HomePage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('shows a heading for each project group', () => {
    render(<HomePage />);
    expect(
      screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent),
    ).toEqual(navGroups.map((group) => group.label));
  });

  it('renders project card titles as headings', () => {
    render(<HomePage />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(
      navGroups.flatMap((group) => group.projects).length,
    );
  });

  it('links each project to its build history', () => {
    render(<HomePage />);
    expect(
      screen.getAllByRole('link', { name: 'View builds' }).map((link) => link.getAttribute('href')),
    ).toEqual(navGroups.flatMap((group) => group.projects.map((project) => `/${project.slug}`)));
  });

  it('offers a latest jar link for every project', () => {
    render(<HomePage />);
    expect(screen.getAllByRole('link', { name: 'Latest JAR' })).toHaveLength(4);
  });
});
