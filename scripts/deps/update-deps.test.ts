import { describe, expect, it } from "vitest";

import {
  applyDependencyUpdates,
  replaceVersionSpecifier,
} from "./update-deps-lib";

describe("replaceVersionSpecifier", () => {
  it("preserves the current operator when writing the latest version", () => {
    expect(replaceVersionSpecifier("^1.2.3", "2.0.0")).toBe("^2.0.0");
    expect(replaceVersionSpecifier("~1.2.3", "2.0.0")).toBe("~2.0.0");
    expect(replaceVersionSpecifier("1.2.3", "2.0.0")).toBe("2.0.0");
  });
});

describe("applyDependencyUpdates", () => {
  it("updates catalog dependencies at the root while keeping catalog consumers unchanged", () => {
    const result = applyDependencyUpdates({
      groupPackages: new Set(["zod"]),
      latestVersions: { zod: "4.3.6" },
      rootManifest: {
        workspaces: {
          packages: ["apps/*", "packages/*"],
          catalog: { zod: "^4.1.13" },
        },
      },
      workspaceManifests: [
        {
          manifest: {
            name: "server",
            dependencies: { zod: "catalog:" },
          },
          path: "apps/server/package.json",
        },
      ],
    });

    expect(result.rootManifest.workspaces?.catalog?.zod).toBe("^4.3.6");
    expect(result.workspaceManifests[0]?.manifest.dependencies?.zod).toBe(
      "catalog:",
    );
    expect(result.changes).toEqual([
      {
        dependencyType: "catalog",
        from: "^4.1.13",
        packageName: "zod",
        path: "package.json",
        to: "^4.3.6",
      },
    ]);
  });

  it("updates duplicated root dependencies alongside the catalog entry", () => {
    const result = applyDependencyUpdates({
      groupPackages: new Set(["dotenv"]),
      latestVersions: { dotenv: "17.3.1" },
      rootManifest: {
        dependencies: { dotenv: "^17.2.2" },
        workspaces: {
          packages: ["apps/*", "packages/*"],
          catalog: { dotenv: "^17.2.2" },
        },
      },
      workspaceManifests: [
        {
          manifest: {
            name: "auth",
            dependencies: { dotenv: "catalog:" },
          },
          path: "packages/auth/package.json",
        },
      ],
    });

    expect(result.rootManifest.workspaces?.catalog?.dotenv).toBe("^17.3.1");
    expect(result.rootManifest.dependencies?.dotenv).toBe("^17.3.1");
    expect(result.changes).toEqual([
      {
        dependencyType: "catalog",
        from: "^17.2.2",
        packageName: "dotenv",
        path: "package.json",
        to: "^17.3.1",
      },
      {
        dependencyType: "dependencies",
        from: "^17.2.2",
        packageName: "dotenv",
        path: "package.json",
        to: "^17.3.1",
      },
    ]);
  });

  it("updates direct workspace dependencies that are not using catalog", () => {
    const result = applyDependencyUpdates({
      groupPackages: new Set(["next"]),
      latestVersions: { next: "16.2.0" },
      rootManifest: {
        workspaces: {
          packages: ["apps/*", "packages/*"],
          catalog: {},
        },
      },
      workspaceManifests: [
        {
          manifest: {
            name: "web",
            dependencies: { next: "^16.1.1" },
          },
          path: "apps/web/package.json",
        },
      ],
    });

    expect(result.workspaceManifests[0]?.manifest.dependencies?.next).toBe(
      "^16.2.0",
    );
    expect(result.changes).toEqual([
      {
        dependencyType: "dependencies",
        from: "^16.1.1",
        packageName: "next",
        path: "apps/web/package.json",
        to: "^16.2.0",
      },
    ]);
  });

  it("does not touch packages outside the selected group", () => {
    const result = applyDependencyUpdates({
      groupPackages: new Set(["typescript"]),
      latestVersions: { typescript: "5.9.4", zod: "4.3.6" },
      rootManifest: {
        devDependencies: { typescript: "^5.9.3" },
        workspaces: {
          packages: ["apps/*", "packages/*"],
          catalog: { zod: "^4.1.13" },
        },
      },
      workspaceManifests: [],
    });

    expect(result.rootManifest.devDependencies?.typescript).toBe("^5.9.4");
    expect(result.rootManifest.workspaces?.catalog?.zod).toBe("^4.1.13");
    expect(result.changes).toHaveLength(1);
  });

  it("returns no changes when everything is already at the latest version", () => {
    const result = applyDependencyUpdates({
      groupPackages: new Set(["vitest"]),
      latestVersions: { vitest: "4.1.0" },
      rootManifest: {
        devDependencies: { vitest: "^4.1.0" },
        workspaces: {
          packages: ["apps/*", "packages/*"],
          catalog: {},
        },
      },
      workspaceManifests: [],
    });

    expect(result.rootManifest.devDependencies?.vitest).toBe("^4.1.0");
    expect(result.changes).toEqual([]);
  });
});
