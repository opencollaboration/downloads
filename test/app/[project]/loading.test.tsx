import Loading from '@/app/[project]/loading';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Loading', () => {
  it('announces the loading state', () => {
    render(<Loading />);
    expect(screen.getByText('Loading builds')).toBeInTheDocument();
  });
});
