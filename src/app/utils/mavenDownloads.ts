import axios from "axios";

const MAVEN_VERSIONS = "https://repo.opencollab.dev/api/maven/versions/maven-snapshots";
const MAVEN_DETAILS = "https://repo.opencollab.dev/api/maven/details/maven-snapshots";
const MAVEN_DOWNLOADS = "https://repo.opencollab.dev/maven-snapshots";

export interface MavenVersion {
    version: string;
    artifacts: MavenArtifact[];
}

export interface MavenArtifact {
    build: string;
    name: string;
    downloadUrl: string;
}

const fetchData = async (url: string) => {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export async function getMavenDownloads(groupId: string, artifactId: string, ignoredVersions: Set<string>): Promise<MavenVersion[]> {
    const path = `${groupId.replace(/\./g, '/')}/${artifactId}`;
    const versionData = await fetchData(`${MAVEN_VERSIONS}/${path}`);

    let versions: MavenVersion[] = [];
    for (const version of versionData.versions) {
        if (ignoredVersions.has(version)) {
            continue;
        }
        const details = await fetchData(`${MAVEN_DETAILS}/${path}/${version}`);
        let builds: MavenArtifact[] = [];

        const versionWithoutSnapshot = version.replace(/-SNAPSHOT$/, '');
        const versionRegex = new RegExp(`^(${artifactId}-${versionWithoutSnapshot}-([0-9]{8}\\.[0-9]{6})-([0-9]+)\\.jar)$`);
        for (const file of details.files) {
            const name = file.name;
            const match = versionRegex.exec(name);
            if (!match) {
                continue;
            }
            const build = match[3];
            builds.push({
                build: build,
                name: match[1],
                downloadUrl: `${MAVEN_DOWNLOADS}/${path}/${version}/${match[1]}`
            });
        }
        builds = builds.reverse();
        versions.push({
            version,
            artifacts: builds
        });
    }
    versions = versions.reverse();
    return versions;
}
