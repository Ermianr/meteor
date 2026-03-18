import type { DependencyGroup } from "./groups";

export type DependencySectionName =
  | "dependencies"
  | "devDependencies"
  | "peerDependencies"
  | "optionalDependencies";

export type PackageManifest = {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  workspaces?:
    | string[]
    | {
        packages?: string[];
        catalog?: Record<string, string>;
        catalogs?: Record<string, Record<string, string>>;
      };
  [key: string]: unknown;
};

export type ManifestFile = {
  path: string;
  manifest: PackageManifest;
};

export type DependencyChange = {
  path: string;
  packageName: string;
  dependencyType: DependencySectionName | "catalog";
  from: string;
  to: string;
};

export type ApplyDependencyUpdatesInput = {
  rootManifest: PackageManifest;
  workspaceManifests: ManifestFile[];
  groupPackages: Set<string>;
  latestVersions: Record<string, string>;
};

export type ApplyDependencyUpdatesResult = {
  rootManifest: PackageManifest;
  workspaceManifests: ManifestFile[];
  changes: DependencyChange[];
};

const dependencySections: DependencySectionName[] = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
];

export function replaceVersionSpecifier(
  currentSpecifier: string,
  latestVersion: string,
): string {
  if (currentSpecifier.startsWith("^")) {
    return `^${latestVersion}`;
  }

  if (currentSpecifier.startsWith("~")) {
    return `~${latestVersion}`;
  }

  return latestVersion;
}

export function applyDependencyUpdates(
  input: ApplyDependencyUpdatesInput,
): ApplyDependencyUpdatesResult {
  const rootManifest = structuredClone(input.rootManifest);
  const workspaceManifests = input.workspaceManifests.map(
    (workspaceManifest) => ({
      ...workspaceManifest,
      manifest: structuredClone(workspaceManifest.manifest),
    }),
  );
  const changes: DependencyChange[] = [];

  for (const packageName of input.groupPackages) {
    const latestVersion = input.latestVersions[packageName];

    if (!latestVersion) {
      continue;
    }

    updateCatalogEntries({
      changes,
      latestVersion,
      packageName,
      rootManifest,
    });

    for (const dependencySection of dependencySections) {
      updateDependencyRecord({
        changes,
        dependencySection,
        latestVersion,
        manifest: rootManifest,
        packageName,
        path: "package.json",
      });
    }

    for (const workspaceManifest of workspaceManifests) {
      for (const dependencySection of dependencySections) {
        updateDependencyRecord({
          changes,
          dependencySection,
          latestVersion,
          manifest: workspaceManifest.manifest,
          packageName,
          path: workspaceManifest.path,
        });
      }
    }
  }

  return {
    changes,
    rootManifest,
    workspaceManifests,
  };
}

export function formatSummaryMarkdown(
  group: DependencyGroup,
  changes: DependencyChange[],
): string {
  const header = `# Dependency updates for ${group.title}\n`;

  if (changes.length === 0) {
    return `${header}\nNo dependency updates were available.\n`;
  }

  const changeLines = changes.map(
    (change) =>
      `- \`${change.packageName}\` (${change.dependencyType}) in \`${change.path}\`: \`${change.from}\` -> \`${change.to}\``,
  );

  return `${header}\n## Updated entries\n${changeLines.join("\n")}\n`;
}

function updateCatalogEntries(input: {
  rootManifest: PackageManifest;
  packageName: string;
  latestVersion: string;
  changes: DependencyChange[];
}): void {
  const workspaces = getWorkspaceObject(input.rootManifest.workspaces);

  if (!workspaces) {
    return;
  }

  const defaultCatalog = workspaces.catalog;

  if (defaultCatalog && input.packageName in defaultCatalog) {
    const currentSpecifier = defaultCatalog[input.packageName];

    if (currentSpecifier) {
      maybeRecordUpdatedSpecifier({
        changes: input.changes,
        currentSpecifier,
        dependencyType: "catalog",
        dependencyTarget: defaultCatalog,
        latestVersion: input.latestVersion,
        packageName: input.packageName,
        path: "package.json",
      });
    }
  }

  const namedCatalogs = workspaces.catalogs ?? {};

  for (const catalogName of Object.keys(namedCatalogs)) {
    const catalog = namedCatalogs[catalogName];

    if (!catalog || !(input.packageName in catalog)) {
      continue;
    }

    const currentSpecifier = catalog[input.packageName];

    if (!currentSpecifier) {
      continue;
    }

    maybeRecordUpdatedSpecifier({
      changes: input.changes,
      currentSpecifier,
      dependencyType: "catalog",
      dependencyTarget: catalog,
      latestVersion: input.latestVersion,
      packageName: input.packageName,
      path: "package.json",
    });
  }
}

function updateDependencyRecord(input: {
  manifest: PackageManifest;
  dependencySection: DependencySectionName;
  packageName: string;
  latestVersion: string;
  path: string;
  changes: DependencyChange[];
}): void {
  const dependencies = input.manifest[input.dependencySection];

  if (!isDependencyMap(dependencies) || !(input.packageName in dependencies)) {
    return;
  }

  const currentSpecifier = dependencies[input.packageName];

  if (!currentSpecifier) {
    return;
  }

  if (
    currentSpecifier.startsWith("catalog:") ||
    currentSpecifier.startsWith("workspace:")
  ) {
    return;
  }

  maybeRecordUpdatedSpecifier({
    changes: input.changes,
    currentSpecifier,
    dependencyType: input.dependencySection,
    dependencyTarget: dependencies,
    latestVersion: input.latestVersion,
    packageName: input.packageName,
    path: input.path,
  });
}

function maybeRecordUpdatedSpecifier(input: {
  dependencyTarget: Record<string, string>;
  packageName: string;
  currentSpecifier: string;
  latestVersion: string;
  dependencyType: DependencySectionName | "catalog";
  path: string;
  changes: DependencyChange[];
}): void {
  const nextSpecifier = replaceVersionSpecifier(
    input.currentSpecifier,
    input.latestVersion,
  );

  if (nextSpecifier === input.currentSpecifier) {
    return;
  }

  input.dependencyTarget[input.packageName] = nextSpecifier;
  input.changes.push({
    dependencyType: input.dependencyType,
    from: input.currentSpecifier,
    packageName: input.packageName,
    path: input.path,
    to: nextSpecifier,
  });
}

function getWorkspaceObject(
  workspaces: PackageManifest["workspaces"],
): Exclude<PackageManifest["workspaces"], string[] | undefined> | undefined {
  if (!workspaces || Array.isArray(workspaces)) {
    return undefined;
  }

  return workspaces;
}

function isDependencyMap(
  value: PackageManifest[DependencySectionName],
): value is Record<string, string> {
  return typeof value === "object" && value !== null;
}
