import { BuildRows } from '@/components/BuildRows';
import type { BuildView } from '@/lib/view/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const build: BuildView = {
  build: '42',
  downloadUrl: 'https://repo.example/server.jar',
  message: 'feat: new item (#180)',
  commitUrl: 'https://github.com/example/repo/commit/abc',
  publishedAt: '2026-09-19T12:38:32Z',
};

describe('BuildRows', () => {
  it('labels the build list', () => {
    render(<BuildRows builds={[build]} label="Cloudburst" />);
    expect(screen.getByRole('list', { name: 'Cloudburst' })).toBeInTheDocument();
  });

  it('shows the build number', () => {
    render(<BuildRows builds={[build]} label="Cloudburst" />);
    expect(screen.getByText('#42')).toBeInTheDocument();
  });

  it('links the commit message when a commit URL exists', () => {
    render(<BuildRows builds={[build]} label="Cloudburst" />);
    expect(screen.getByRole('link', { name: 'feat: new item (#180)' })).toHaveAttribute(
      'href',
      build.commitUrl,
    );
  });

  it('shows an unlinked message when there is no commit URL', () => {
    render(<BuildRows builds={[{ ...build, commitUrl: null }]} label="Cloudburst" />);
    expect(screen.queryByRole('link', { name: build.message! })).not.toBeInTheDocument();
    expect(screen.getByText(build.message!)).toBeInTheDocument();
  });

  it('renders publication time as a datetime', () => {
    render(<BuildRows builds={[build]} label="Cloudburst" />);
    expect(screen.getByText('19 Sep 2026, 12:38 UTC').closest('time')).toHaveAttribute(
      'datetime',
      build.publishedAt,
    );
  });

  it('omits publication time when unavailable', () => {
    const { container } = render(
      <BuildRows builds={[{ ...build, publishedAt: null }]} label="Cloudburst" />,
    );
    expect(container.querySelector('time')).not.toBeInTheDocument();
  });

  it('links the jar and checksum separately', () => {
    render(<BuildRows builds={[build]} label="Cloudburst" />);
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute(
      'href',
      build.downloadUrl,
    );
    expect(screen.getByRole('link', { name: 'SHA1' })).toHaveAttribute(
      'href',
      `${build.downloadUrl}.sha1`,
    );
  });

  it('renders an empty named list with no builds', () => {
    render(<BuildRows builds={[]} label="Cloudburst" />);
    expect(screen.getByRole('list', { name: 'Cloudburst' })).toBeEmptyDOMElement();
  });
});
