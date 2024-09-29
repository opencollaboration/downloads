import * as React from "react";
import {ComponentType, useEffect, useState} from "react";
import {MavenVersion, getMavenDownloads} from "@app/utils/mavenDownloads";
import {
  Button,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  PageSection,
  Title
} from "@patternfly/react-core";

export interface DownloadComponentProps {
  projectName: string;
  artifactId: string;
  groupId: string;
  ignoredVersions?: string[];
}

const DownloadComponent: React.FunctionComponent<DownloadComponentProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<MavenVersion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const result = await getMavenDownloads(props.groupId, props.artifactId, new Set<string>(props.ignoredVersions))
        setData(result);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    getData()
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return data.map(value => {
    return (
      <PageSection key={value.version} hasBodyWrapper={false}>
        <Title headingLevel="h1" size="lg">{value.version}</Title>
        <DataList aria-label={value.version}>
          <BuildsComponent artifacts={value.artifacts} version={value.version}/>
        </DataList>
      </PageSection>
    )
  })
}

const BuildsComponent: ComponentType<MavenVersion> = (props) => {
  return (
    props.artifacts.map(value => {
      return (
        <DataListItem key={value.downloadUrl} aria-labelledby={value.build}>
          <DataListItemRow>
            <DataListItemCells
              dataListCells={[
                <DataListCell key="Id">#{value.build}</DataListCell>,
                <DataListCell key="Name">{value.name}</DataListCell>,
                <DataListCell key="URL"><Button component="a" href={value.downloadUrl} variant="primary">Download</Button></DataListCell>
              ]}
            />
          </DataListItemRow>
        </DataListItem>
      )
    })
  )
}

export { DownloadComponent };
