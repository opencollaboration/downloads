import ProjectError from '@/app/[project]/error';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('ProjectError', () => {
  it('explains that the download list is unavailable', () => {
    render(<ProjectError error={new Error('offline')} reset={vi.fn()} />);
    expect(screen.getByText(/The download list could not be loaded/)).toBeInTheDocument();
  });

  it('calls reset when retry is clicked', () => {
    const reset = vi.fn();
    render(<ProjectError error={new Error('offline')} reset={reset} />);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
