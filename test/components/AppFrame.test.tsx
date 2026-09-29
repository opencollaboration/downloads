import { AppFrame } from '@/components/AppFrame';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const navigation = vi.hoisted(() => ({ pathname: '/' }));

vi.mock('next/navigation', () => ({ usePathname: () => navigation.pathname }));
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.ComponentProps<'a'>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

beforeEach(() => {
  navigation.pathname = '/';
  window.innerWidth = 1440;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('AppFrame', () => {
  it('renders the main region with page content', () => {
    render(<AppFrame>Build history</AppFrame>);
    expect(screen.getByRole('main')).toHaveTextContent('Build history');
  });

  it('shows the brand image', () => {
    render(<AppFrame>Build history</AppFrame>);
    expect(screen.getByRole('img', { name: 'Open Collaboration' })).toHaveAttribute(
      'src',
      '/images/logo.png',
    );
  });

  it('renders the home link', () => {
    render(<AppFrame>Build history</AppFrame>);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
  });

  it('expands the group for the current project only', () => {
    navigation.pathname = '/cloudburst';
    render(<AppFrame>Build history</AppFrame>);
    expect(screen.getByRole('button', { name: 'CloudburstMC' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('button', { name: 'GeyserMC' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('marks the current project as active', () => {
    navigation.pathname = '/cloudburst';
    render(<AppFrame>Build history</AppFrame>);
    expect(screen.getByRole('link', { name: 'Cloudburst' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('does not move focus on the first render', () => {
    vi.useFakeTimers();
    render(<AppFrame>Build history</AppFrame>);
    act(() => vi.advanceTimersByTime(100));
    expect(screen.getByRole('main')).not.toHaveFocus();
  });

  it('moves focus to the main region after a route change', () => {
    vi.useFakeTimers();
    const { rerender } = render(<AppFrame>Home</AppFrame>);
    navigation.pathname = '/cloudburst';
    rerender(<AppFrame>Build history</AppFrame>);
    act(() => vi.advanceTimersByTime(50));
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('focuses the main region when the skip link is used', () => {
    render(<AppFrame>Build history</AppFrame>);
    fireEvent.click(screen.getByRole('link', { name: 'Skip to Content' }));
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('starts with the sidebar collapsed on a narrow viewport', () => {
    window.innerWidth = 600;
    render(<AppFrame>Build history</AppFrame>);
    expect(screen.getByRole('button', { name: 'Global navigation' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('opens the sidebar from the masthead on a narrow viewport', () => {
    window.innerWidth = 600;
    render(<AppFrame>Build history</AppFrame>);
    fireEvent.click(screen.getByRole('button', { name: 'Global navigation' }));
    expect(screen.getByRole('button', { name: 'Global navigation' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});
