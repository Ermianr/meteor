#!/usr/bin/env bun
/**
 * Bumps the entries in `workspaces.catalog` of the root package.json within
 * their existing semver range, then regenerates bun.lock.
 *
 * Why a custom script instead of `bun update`:
 *   `bun update <name>` resolves the `catalog:` reference in the root
 *   package.json into a literal version, leaving `workspaces.catalog` stale
 *   (Bun 1.3.x). To keep the catalog as the single source of truth, we mutate
 *   `workspaces.catalog` directly and let `bun install` refresh the lockfile.
 *
 * Policy: stay within the existing semver range — no major bumps, mirroring
 * Dependabot's `bun-minor-patch` group. Pre-release versions are skipped.
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import semver from "semver";

type RootPackageJson = {
  workspaces?: {
    catalog?: Record<string, string>;
  };
};

type RegistryResponse = {
  versions: Record<string, unknown>;
};

type Bump = {
  name: string;
  from: string;
  to: string;
};

const rootPkgPath = resolve(import.meta.dir, "..", "package.json");
const rawPkg = readFileSync(rootPkgPath, "utf8");
const pkg = JSON.parse(rawPkg) as RootPackageJson;
const catalog = pkg.workspaces?.catalog ?? {};
const names = Object.keys(catalog);

if (names.length === 0) {
  console.log("Catalog is empty. Nothing to update.");
  process.exit(0);
}

console.log(`Inspecting ${names.length} catalog deps...`);

const bumps: Bump[] = [];
const skipped: string[] = [];

for (const name of names) {
  const range = catalog[name] as string;
  const prefixMatch = range.match(/^(\^|~)?(.+)$/);
  if (!prefixMatch) {
    skipped.push(`${name}: cannot parse range "${range}"`);
    continue;
  }
  const prefix = prefixMatch[1] ?? "";
  const baseSpec = prefixMatch[2] as string;

  if (prefix === "" && semver.valid(baseSpec)) {
    skipped.push(`${name}: pinned exactly to ${baseSpec}`);
    continue;
  }

  if (!semver.validRange(range)) {
    skipped.push(`${name}: invalid range "${range}"`);
    continue;
  }

  const url = `https://registry.npmjs.org/${encodeURIComponent(name)}`;
  const res = await fetch(url);
  if (!res.ok) {
    skipped.push(`${name}: registry returned ${res.status}`);
    continue;
  }
  const data = (await res.json()) as RegistryResponse;
  const stableVersions = Object.keys(data.versions).filter(
    (v) => semver.valid(v) !== null && semver.prerelease(v) === null,
  );

  const target = semver.maxSatisfying(stableVersions, range);
  if (!target) {
    skipped.push(`${name}: no stable version satisfies "${range}"`);
    continue;
  }

  const currentMin = semver.minVersion(range);
  if (!currentMin) {
    skipped.push(`${name}: cannot derive current version from "${range}"`);
    continue;
  }

  if (semver.gt(target, currentMin.version)) {
    bumps.push({
      name,
      from: range,
      to: `${prefix}${target}`,
    });
  }
}

if (skipped.length > 0) {
  console.log("\nSkipped:");
  for (const note of skipped) {
    console.log(`  - ${note}`);
  }
}

if (bumps.length === 0) {
  console.log("\nNo catalog bumps available.");
  process.exit(0);
}

console.log(`\nApplying ${bumps.length} catalog bumps:`);
for (const bump of bumps) {
  console.log(`  - ${bump.name}: ${bump.from} -> ${bump.to}`);
}

let updatedRaw = rawPkg;
for (const bump of bumps) {
  const escapedName = bump.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedFrom = bump.from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`("${escapedName}"\\s*:\\s*)"${escapedFrom}"`);
  const before = updatedRaw;
  updatedRaw = updatedRaw.replace(pattern, `$1"${bump.to}"`);
  if (updatedRaw === before) {
    console.error(
      `Failed to rewrite ${bump.name} in package.json (pattern not found).`,
    );
    process.exit(1);
  }
}

writeFileSync(rootPkgPath, updatedRaw);
console.log("\nUpdated workspaces.catalog. Refreshing bun.lock...");

const installResult = spawnSync("bun", ["install"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(installResult.status ?? 1);
