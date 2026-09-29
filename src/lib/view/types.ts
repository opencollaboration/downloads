/**
 * View models handed to the UI.
 *
 * These cross the server/client boundary, since builds are paginated in the
 * browser. A raw `MavenArtifact` carries around twenty properties of which
 * three are displayed, so the reduced shape keeps the payload small.
 */

export interface BuildView {
  build: string;
  downloadUrl: string;
  message: string | null;
  commitUrl: string | null;
  /** ISO 8601 publication time, or null when the filename lacked one. */
  publishedAt: string | null;
}

export interface VersionView {
  version: string;
  builds: BuildView[];
}
