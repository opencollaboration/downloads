import { BuildRows } from '@/components/BuildRows';
import { PaginatedBuilds } from '@/components/PaginatedBuilds';
import { Pagination, PaginationVariant } from '@/components/ui/patternfly';
import { DEFAULT_PER_PAGE } from '@/lib/pagination';
import type { BuildView } from '@/lib/view/types';
import { Suspense } from 'react';

interface BuildsSectionProps {
  builds: BuildView[];
  label: string;
  paramPrefix?: string;
}

/**
 * Reading the page from the URL makes `PaginatedBuilds` client rendered, and
 * this boundary's fallback is what gets prerendered into the static HTML.
 *
 * So the fallback renders a real first page rather than a spinner, with the
 * controls disabled so nothing shifts when the interactive version takes over.
 */
export function BuildsSection({ builds, label, paramPrefix }: BuildsSectionProps) {
  const isPaginated = builds.length > DEFAULT_PER_PAGE;

  const staticPagination = (variant: PaginationVariant) => (
    <Pagination
      itemCount={builds.length}
      perPage={DEFAULT_PER_PAGE}
      page={1}
      variant={variant}
      isCompact={variant === PaginationVariant.top}
      isDisabled
      titles={{
        paginationAriaLabel: `${label} builds pagination`,
        items: 'builds',
      }}
    />
  );

  const fallback = (
    <>
      <BuildRows builds={builds.slice(0, DEFAULT_PER_PAGE)} label={label} />
      {isPaginated && staticPagination(PaginationVariant.bottom)}
    </>
  );

  return (
    <Suspense fallback={fallback}>
      <PaginatedBuilds builds={builds} label={label} paramPrefix={paramPrefix} />
    </Suspense>
  );
}
