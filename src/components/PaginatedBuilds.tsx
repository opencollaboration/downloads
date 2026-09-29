'use client';

import { BuildRows } from '@/components/BuildRows';
import { ALLOWED_PER_PAGE, DEFAULT_PER_PAGE, PER_PAGE_OPTIONS } from '@/lib/pagination';
import type { BuildView } from '@/lib/view/types';
import { Pagination, PaginationVariant } from '@patternfly/react-core';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

interface PaginatedBuildsProps {
  builds: BuildView[];
  /** Used for accessible labelling of the list and its pagination. */
  label: string;
  /**
   * Query parameter prefix. Each version paginates independently, so a project
   * with more than one version needs distinct keys.
   */
  paramPrefix?: string;
}

/** Read a positive integer from the query string, falling back when absent or invalid. */
function readNumber(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Renders a version's builds one page at a time, with the current page held in
 * the URL so a given page can be linked to and survives reload and back.
 *
 * Only non-default values are written, so the common case stays a clean URL.
 */
export function PaginatedBuilds({ builds, label, paramPrefix }: PaginatedBuildsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageKey = paramPrefix ? `${paramPrefix}-page` : 'page';
  const perPageKey = paramPrefix ? `${paramPrefix}-perPage` : 'perPage';

  const requestedPerPage = readNumber(searchParams.get(perPageKey), DEFAULT_PER_PAGE);
  const perPage = ALLOWED_PER_PAGE.includes(requestedPerPage) ? requestedPerPage : DEFAULT_PER_PAGE;

  const lastPage = Math.max(1, Math.ceil(builds.length / perPage));
  // Clamp rather than showing an empty list for an out-of-range page.
  const page = Math.min(readNumber(searchParams.get(pageKey), 1), lastPage);

  const isPaginated = builds.length > DEFAULT_PER_PAGE;

  const visibleBuilds = useMemo(() => {
    if (!isPaginated) {
      return builds;
    }

    const start = (page - 1) * perPage;
    return builds.slice(start, start + perPage);
  }, [builds, isPaginated, page, perPage]);

  const updateQuery = useCallback(
    (nextPage: number, nextPerPage: number) => {
      const params = new URLSearchParams(searchParams.toString());

      // Keep defaults out of the URL.
      if (nextPage > 1) {
        params.set(pageKey, String(nextPage));
      } else {
        params.delete(pageKey);
      }

      if (nextPerPage !== DEFAULT_PER_PAGE) {
        params.set(perPageKey, String(nextPerPage));
      } else {
        params.delete(perPageKey);
      }

      const query = params.toString();

      // `replace` keeps paging out of the back history, so Back returns to the
      // previous page of the site rather than stepping through page numbers.
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pageKey, pathname, perPageKey, router, searchParams],
  );

  const renderPagination = (variant: PaginationVariant) => (
    <Pagination
      itemCount={builds.length}
      perPage={perPage}
      page={page}
      variant={variant}
      isCompact={variant === PaginationVariant.top}
      perPageOptions={PER_PAGE_OPTIONS}
      onSetPage={(_event, nextPage) => updateQuery(nextPage, perPage)}
      onPerPageSelect={(_event, nextPerPage, nextPage) => updateQuery(nextPage, nextPerPage)}
      titles={{
        paginationAriaLabel: `${label} builds pagination`,
        items: 'builds',
      }}
    />
  );

  return (
    <>
      <BuildRows builds={visibleBuilds} label={label} />
      {isPaginated && renderPagination(PaginationVariant.bottom)}
    </>
  );
}
