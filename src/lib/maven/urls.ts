export function buildLatestJarUrl(
  latestEndpoint: string,
  groupId: string,
  artifactId: string,
  version?: string,
): string {
  const path = `${groupId.replace(/\./g, '/')}/${artifactId}`;
  return version
    ? `${latestEndpoint}/${path}/${version}?extension=jar`
    : `${latestEndpoint}/${path}?extension=jar`;
}
