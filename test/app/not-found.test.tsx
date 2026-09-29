import NotFound, { metadata } from '@/app/not-found';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe('NotFound route', () => {
  it('sets a descriptive page title', () => {
    expect(metadata.title).toBe('404 Page Not Found');
  });

  it('renders the recovery action', () => {
    render(<NotFound />);
    expect(screen.getByRole('button', { name: 'Take me home' })).toBeInTheDocument();
  });
});
