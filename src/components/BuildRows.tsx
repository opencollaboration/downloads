import {
  Button,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
} from '@/components/ui/patternfly';
import { formatBuildTime } from '@/lib/format';
import type { BuildView } from '@/lib/view/types';

interface BuildRowsProps {
  builds: BuildView[];
  label: string;
}

/**
 * Carries no directive, so it renders on the server when the static fallback
 * uses it and compiles into the client bundle when `PaginatedBuilds` does.
 * Both paths therefore produce identical markup.
 */
export function BuildRows({ builds, label }: BuildRowsProps) {
  return (
    <DataList aria-label={label} className="oc-build-list">
      {builds.map((build) => (
        <DataListItem key={build.downloadUrl} aria-labelledby={`build-${build.build}`}>
          <DataListItemRow>
            <DataListItemCells
              dataListCells={[
                <DataListCell key="id" id={`build-${build.build}`} className="oc-build__id">
                  #{build.build}
                </DataListCell>,
                <DataListCell key="published" className="oc-build__published">
                  {build.publishedAt ? (
                    <time dateTime={build.publishedAt}>{formatBuildTime(build.publishedAt)}</time>
                  ) : null}
                </DataListCell>,
                <DataListCell key="changes" className="oc-build__message">
                  {build.message && build.commitUrl ? (
                    <a href={build.commitUrl}>{build.message}</a>
                  ) : (
                    build.message
                  )}
                </DataListCell>,
                <DataListCell key="download" className="oc-build__action">
                  <Button component="a" href={build.downloadUrl} variant="primary">
                    Download
                  </Button>
                </DataListCell>,
                <DataListCell key="hash" className="oc-build__action">
                  <Button component="a" href={`${build.downloadUrl}.sha1`} variant="secondary">
                    SHA1
                  </Button>
                </DataListCell>,
              ]}
            />
          </DataListItemRow>
        </DataListItem>
      ))}
    </DataList>
  );
}
