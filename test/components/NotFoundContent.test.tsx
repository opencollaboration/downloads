import { NotFoundContent } from '@/components/NotFoundContent';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const navigation = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({ useRouter: () => navigation }));

describe('NotFoundContent', () => {
  it('explains that the requested page was not found', () => {
    render(<NotFoundContent />);
    expect(screen.getByText(/We didn't find a page/)).toBeInTheDocument();
  });

  it('returns home when its action is clicked', () => {
    navigation.push.mockReset();
    render(<NotFoundContent />);
    fireEvent.click(screen.getByRole('button', { name: 'Take me home' }));
    expect(navigation.push).toHaveBeenCalledWith('/');
  });
});
