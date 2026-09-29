export interface MavenArtifact {
  build: string;
  name: string;
  downloadUrl: string;
  publishedAt: string | null;
  properties: Record<string, string>;
}

export interface MavenVersion {
  version: string;
  artifacts: MavenArtifact[];
}

export interface ResolvedVersion {
  version: MavenVersion;
  propertyFiles: { artifact: MavenArtifact; url: string }[];
}

export interface MavenCoordinates {
  groupId: string;
  artifactId: string;
}

export interface MavenQuery extends MavenCoordinates {
  ignoredVersions?: string[];
  acceptedVersions?: string[];
}

export interface ArtifactMatchers {
  jar: RegExp;
  properties: RegExp;
}

export interface MavenVersionsResponse {
  versions?: string[];
}

export interface MavenDetailsResponse {
  files?: { name?: string }[];
}
