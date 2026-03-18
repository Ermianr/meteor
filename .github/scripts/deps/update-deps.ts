import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { dependencyGroups, getDependencyGroup } from "./groups";
import {
  applyDependencyUpdates,
  formatSummaryMarkdown,
  type ManifestFile,
  type PackageManifest,
} from "./update-deps-lib";

type CliOptions = {
  group: string;
  strategy: string;
  rootDir: string;
  summaryFile?: string;
};

const registryBaseUrl = "https://registry.npmjs.org";

if (import.meta.main) {
  await main();
}

async function main(): Promise<void> {
  const options = parseCliArgs(process.argv.slice(2));

  if (options.strategy !== "latest") {
    throw new Error(
      `Unsupported strategy "${options.strategy}". Only "latest" is supported.`,
    );
  }

  const group = getDependencyGroup(options.group);
  const rootPackagePath = path.join(options.rootDir, "package.json");
  const rootManifest = await readPackageManifest(rootPackagePath);
  const workspacePackagePaths = await findWorkspacePackagePaths(
    options.rootDir,
    rootManifest,
  );
  const workspaceManifests = await Promise.all(
    workspacePackagePaths.map(async (workspacePath) => ({
      manifest: await readPackageManifest(workspacePath),
      path: path.relative(options.rootDir, workspacePath).replaceAll("\\", "/"),
    })),
  );
  const latestVersions = await fetchLatestVersions(group.packages);
  const result = applyDependencyUpdates({
    groupPackages: new Set(group.packages),
    latestVersions,
    rootManifest,
    workspaceManifests,
  });

  await writeChangedPackageManifests({
    rootDir: options.rootDir,
    rootManifest: result.rootManifest,
    workspaceManifests: result.workspaceManifests,
  });

  const summary = formatSummaryMarkdown(group, result.changes);
  if (options.summaryFile) {
    const summaryPath = path.resolve(options.rootDir, options.summaryFile);
    await mkdir(path.dirname(summaryPath), { recursive: true });
    await writeFile(summaryPath, summary, "utf8");
  }

  if (result.changes.length === 0) {
    console.log(`No updates available for group "${group.id}".`);
    return;
  }

  for (const change of result.changes) {
    console.log(
      `${change.path} :: ${change.packageName} (${change.dependencyType}) ${change.from} -> ${change.to}`,
    );
  }
}

function parseCliArgs(args: string[]): CliOptions {
  const parsedArgs = new Map<string, string>();

  for (const arg of args) {
    if (!arg.startsWith("--")) {
      continue;
    }

    const [rawKey, ...rest] = arg.slice(2).split("=");
    const value = rest.join("=");

    if (!rawKey || value.length === 0) {
      continue;
    }

    parsedArgs.set(rawKey, value);
  }

  const group = parsedArgs.get("group");
  const strategy = parsedArgs.get("strategy") ?? "latest";

  if (!group) {
    const availableGroups = dependencyGroups.map(({ id }) => id).join(", ");
    throw new Error(
      `Missing required --group option. Expected one of: ${availableGroups}`,
    );
  }

  return {
    group,
    rootDir: path.resolve(parsedArgs.get("root") ?? process.cwd()),
    strategy,
    summaryFile: parsedArgs.get("summary-file"),
  };
}

async function findWorkspacePackagePaths(
  rootDir: string,
  rootManifest: PackageManifest,
): Promise<string[]> {
  const workspaces = Array.isArray(rootManifest.workspaces)
    ? rootManifest.workspaces
    : (rootManifest.workspaces?.packages ?? ["apps/*", "packages/*"]);
  const packagePaths = new Set<string>();

  for (const workspacePattern of workspaces) {
    const resolvedPaths = await expandWorkspacePattern(
      rootDir,
      workspacePattern,
    );

    for (const resolvedPath of resolvedPaths) {
      packagePaths.add(resolvedPath);
    }
  }

  return [...packagePaths];
}

async function expandWorkspacePattern(
  rootDir: string,
  workspacePattern: string,
): Promise<string[]> {
  const normalizedPattern = workspacePattern.replaceAll("\\", "/");

  if (!normalizedPattern.endsWith("/*")) {
    return [];
  }

  const workspaceDir = normalizedPattern.slice(0, -2);
  const absoluteWorkspaceDir = path.resolve(rootDir, workspaceDir);

  let directoryEntries: Awaited<ReturnType<typeof readdir>>;

  try {
    directoryEntries = await readdir(absoluteWorkspaceDir, {
      withFileTypes: true,
    });
  } catch (error) {
    if (isMissingDirectoryError(error)) {
      return [];
    }

    throw error;
  }

  return directoryEntries
    .filter((directoryEntry) => directoryEntry.isDirectory())
    .map((directoryEntry) =>
      path.join(absoluteWorkspaceDir, directoryEntry.name, "package.json"),
    );
}

async function fetchLatestVersions(
  packageNames: string[],
): Promise<Record<string, string>> {
  const latestEntries = await Promise.all(
    packageNames.map(async (packageName) => [
      packageName,
      await fetchLatestVersion(packageName),
    ]),
  );

  return Object.fromEntries(latestEntries);
}

async function fetchLatestVersion(packageName: string): Promise<string> {
  const response = await fetch(
    `${registryBaseUrl}/${encodePackageName(packageName)}/latest`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch latest version for ${packageName}: ${response.status} ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as { version?: string };

  if (!payload.version) {
    throw new Error(
      `Registry response for ${packageName} did not include version`,
    );
  }

  return payload.version;
}

function encodePackageName(packageName: string): string {
  return packageName.replace("/", "%2f");
}

async function readPackageManifest(filePath: string): Promise<PackageManifest> {
  const fileContents = await readFile(filePath, "utf8");
  return JSON.parse(fileContents) as PackageManifest;
}

async function writeChangedPackageManifests(input: {
  rootDir: string;
  rootManifest: PackageManifest;
  workspaceManifests: ManifestFile[];
}): Promise<void> {
  await writeJsonFile(
    path.join(input.rootDir, "package.json"),
    input.rootManifest,
  );

  for (const workspaceManifest of input.workspaceManifests) {
    await writeJsonFile(
      path.resolve(input.rootDir, workspaceManifest.path),
      workspaceManifest.manifest,
    );
  }
}

async function writeJsonFile(
  filePath: string,
  manifest: PackageManifest,
): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

function isMissingDirectoryError(
  error: unknown,
): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
