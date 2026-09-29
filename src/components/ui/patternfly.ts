'use client';

/**
 * Client boundary for PatternFly primitives.
 *
 * PatternFly 6 ships no `'use client'` directives, and components like `Page`
 * touch `ResizeObserver` and `document`. Re-exporting through one client module
 * lets Server Components use them without opting out of server rendering.
 *
 * Only re-export what is used. Every symbol here enters the client bundle.
 */
export {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Content,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Gallery,
  Label,
  PageSection,
  Pagination,
  PaginationVariant,
  Skeleton,
  Title,
} from '@patternfly/react-core';
