import type { MavenArtifact, MavenVersion } from '@/lib/maven/types';
import type { BuildView, VersionView } from '@/lib/view/types';

function getCommitUrl(properties: Record<string, string>): string | null {
  const commit = properties['git.commit.id'];
  const repo = properties['github.repo'];

  if (!commit || !repo) {
    return null;
  }

  return `https://github.com/${repo}/commit/${commit}`;
}

export function toBuildView(artifact: MavenArtifact): BuildView {
  return {
    build: artifact.build,
    downloadUrl: artifact.downloadUrl,
    message: artifact.properties['git.commit.message.short'] ?? null,
    commitUrl: getCommitUrl(artifact.properties),
    publishedAt: artifact.publishedAt,
  };
}

export function toVersionView(version: MavenVersion): VersionView {
  return {
    version: version.version,
    builds: version.artifacts.map(toBuildView),
  };
}
