#!/usr/bin/env bun
/**
 * Unified dependency updater for the meteor monorepo.
 *
 * Replaces Dependabot by scanning all package.json files, querying the npm
 * registry, and bumping versions within their existing semver prefix.
 *
 * Areas:
 *   - catalog:  workspaces.catalog in the root package.json
 *   - root:     dependencies/devDependencies in the root package.json
 *   - backend:  apps/server, packages/db, packages/auth
 *   - frontend: apps/web, packages/ui
 *
 * A dependency that appears in multiple areas is assigned to the highest-
 * priority area: catalog > root > backend > frontend.
 *
 * Policy (mirrors the old update-catalog.ts behaviour):
 *   - Stay within the existing semver range (no major bumps).
 *   - Skip exact pins.
 *   - Skip pre-release versions.
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import semver from "semver";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type PackageJson = {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  workspaces?: {
    catalog?: Record<string, string>;
  };
};

type DepEntry = {
  name: string;
  currentRange: string;
  pkgPath: string;
  rawPkg: string;
  area: Area;
  isCatalog: boolean;
};

type Bump = {
  name: string;
  from: string;
  to: string;
  area: Area;
  files: string[];
};

type RegistryResponse = {
  versions: Record<string, unknown>;
};

type Area = "catalog" | "root" | "backend" | "frontend";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const AREAS: Area[] = ["catalog", "root", "backend", "frontend"];

const AREA_PRIORITY: Record<Area, number> = {
  catalog: 4,
  root: 3,
  backend: 2,
  frontend: 1,
};

const WORKSPACE_MAP: Record<string, Area> = {
  "apps/server": "backend",
  "packages/db": "backend",
  "packages/auth": "backend",
  "apps/web": "frontend",
  "packages/ui": "frontend",
};

const repoRoot = resolve(import.meta.dir, "..");
const rootPkgPath = resolve(repoRoot, "package.json");

/* ------------------------------------------------------------------ */
/* CLI args                                                            */
/* ------------------------------------------------------------------ */

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const areaFlagIdx = args.indexOf("--area");
const targetArea: Area | null =
  areaFlagIdx !== -1 && args[areaFlagIdx + 1]
    ? (args[areaFlagIdx + 1] as Area)
    : null;

if (targetArea && !AREAS.includes(targetArea)) {
  console.error(`Unknown area "${targetArea}". Valid: ${AREAS.join(", ")}`);
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function loadPkg(path: string): { pkg: PackageJson; raw: string } {
  const raw = readFileSync(path, "utf8");
  return { pkg: JSON.parse(raw) as PackageJson, raw };
}

function getAreaForPath(pkgPath: string): Area {
  const relative = pkgPath
    .replace(`${repoRoot}\\`, "")
    .replace(`${repoRoot}/`, "");
  if (relative === "package.json") return "root";
  for (const [prefix, area] of Object.entries(WORKSPACE_MAP)) {
    if (
      relative.startsWith(prefix.replace("/", "\\")) ||
      relative.startsWith(prefix)
    ) {
      return area;
    }
  }
  return "root";
}

function isCatalogReference(range: string): boolean {
  return range === "catalog:";
}

function isWorkspaceReference(range: string): boolean {
  return range.startsWith("workspace:");
}

function isLiteralVersion(range: string): boolean {
  return !isCatalogReference(range) && !isWorkspaceReference(range);
}

function extractPrefixAndBase(
  range: string,
): { prefix: string; base: string } | null {
  const m = range.match(/^(\^|~)?(.+)$/);
  if (!m) return null;
  return { prefix: m[1] ?? "", base: m[2] as string };
}

function shouldSkipRange(range: string): { skip: boolean; reason?: string } {
  if (!semver.validRange(range)) {
    return { skip: true, reason: `invalid range "${range}"` };
  }
  const extracted = extractPrefixAndBase(range);
  if (!extracted) {
    return { skip: true, reason: `cannot parse range "${range}"` };
  }
  const { prefix, base } = extracted;
  if (prefix === "" && semver.valid(base)) {
    return { skip: true, reason: `pinned exactly to ${base}` };
  }
  return { skip: false };
}

async function resolveLatestInRange(
  name: string,
  range: string,
): Promise<string | null> {
  const url = `https://registry.npmjs.org/${encodeURIComponent(name)}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`  ${name}: registry returned ${res.status}`);
    return null;
  }
  const data = (await res.json()) as RegistryResponse;
  const stable = Object.keys(data.versions).filter(
    (v) => semver.valid(v) !== null && semver.prerelease(v) === null,
  );
  return semver.maxSatisfying(stable, range);
}

function applyBumpToRaw(
  raw: string,
  name: string,
  from: string,
  to: string,
): string {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedFrom = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`("${escapedName}"\\s*:\\s*)"${escapedFrom}"`);
  const updated = raw.replace(pattern, `$1"${to}"`);
  if (updated === raw) {
    throw new Error(`Pattern not found for ${name}: ${from}`);
  }
  return updated;
}

/* ------------------------------------------------------------------ */
/* Discovery                                                           */
/* ------------------------------------------------------------------ */

const rootPkg = loadPkg(rootPkgPath);
const workspacePkgPaths = [
  "apps/server/package.json",
  "apps/web/package.json",
  "packages/db/package.json",
  "packages/auth/package.json",
  "packages/ui/package.json",
].map((p) => resolve(repoRoot, p));

const allPkgPaths = [rootPkgPath, ...workspacePkgPaths];

// Load every package.json
const loadedPkgs = new Map<string, { pkg: PackageJson; raw: string }>();
for (const p of allPkgPaths) {
  loadedPkgs.set(p, loadPkg(p));
}

// Collect all literal dependencies grouped by area
const depMap = new Map<string, DepEntry[]>();

// --- catalog ---
const catalog = rootPkg.pkg.workspaces?.catalog ?? {};
for (const [name, range] of Object.entries(catalog)) {
  const entries = depMap.get(name) ?? [];
  entries.push({
    name,
    currentRange: range as string,
    pkgPath: rootPkgPath,
    rawPkg: rootPkg.raw,
    area: "catalog",
    isCatalog: true,
  });
  depMap.set(name, entries);
}

// --- root (non-catalog) ---
for (const field of ["dependencies", "devDependencies"] as const) {
  const deps = rootPkg.pkg[field];
  if (!deps) continue;
  for (const [name, range] of Object.entries(deps)) {
    if (!isLiteralVersion(range)) continue;
    const entries = depMap.get(name) ?? [];
    entries.push({
      name,
      currentRange: range,
      pkgPath: rootPkgPath,
      rawPkg: rootPkg.raw,
      area: "root",
      isCatalog: false,
    });
    depMap.set(name, entries);
  }
}

// --- workspaces ---
for (const pkgPath of workspacePkgPaths) {
  const entry = loadedPkgs.get(pkgPath);
  if (!entry) throw new Error(`Package not loaded: ${pkgPath}`);
  const { pkg, raw } = entry;
  const area = getAreaForPath(pkgPath);
  for (const field of ["dependencies", "devDependencies"] as const) {
    const deps = pkg[field];
    if (!deps) continue;
    for (const [name, range] of Object.entries(deps)) {
      if (!isLiteralVersion(range)) continue;
      const entries = depMap.get(name) ?? [];
      entries.push({
        name,
        currentRange: range,
        pkgPath,
        rawPkg: raw,
        area,
        isCatalog: false,
      });
      depMap.set(name, entries);
    }
  }
}

// Assign each dependency to its highest-priority area
const areaAssignments = new Map<string, { area: Area; entries: DepEntry[] }>();
for (const [name, entries] of depMap) {
  const highest = entries.reduce((best, e) =>
    AREA_PRIORITY[e.area] > AREA_PRIORITY[best.area] ? e : best,
  );
  areaAssignments.set(name, { area: highest.area, entries });
}

/* ------------------------------------------------------------------ */
/* Filtering by --area                                                 */
/* ------------------------------------------------------------------ */

const areasToProcess = targetArea ? [targetArea] : AREAS;

/* ------------------------------------------------------------------ */
/* Resolution & Bumping                                                */
/* ------------------------------------------------------------------ */

const bumpsByArea = new Map<Area, Bump[]>();
const skipped: string[] = [];

for (const [name, { area, entries }] of areaAssignments) {
  if (!areasToProcess.includes(area)) continue;

  // Use the range from the highest-priority entry (all entries in the same
  // area should have the same range, but we take the first just in case).
  const representative = entries.find((e) => e.area === area);
  if (!representative)
    throw new Error(`No representative found for ${name} in ${area}`);
  const range = representative.currentRange;

  const skipCheck = shouldSkipRange(range);
  if (skipCheck.skip) {
    skipped.push(`${name} (${area}): ${skipCheck.reason}`);
    continue;
  }

  const target = await resolveLatestInRange(name, range);
  if (!target) {
    skipped.push(`${name} (${area}): no stable version satisfies "${range}"`);
    continue;
  }

  const currentMin = semver.minVersion(range);
  if (!currentMin) {
    skipped.push(
      `${name} (${area}): cannot derive current version from "${range}"`,
    );
    continue;
  }

  if (semver.gt(target, currentMin.version)) {
    const extracted = extractPrefixAndBase(range);
    if (!extracted) throw new Error(`Cannot extract prefix/base for ${range}`);
    const newRange = `${extracted.prefix}${target}`;

    const files = new Set<string>();
    for (const e of entries) {
      if (e.area === area) files.add(e.pkgPath);
    }

    const bumps = bumpsByArea.get(area) ?? [];
    bumps.push({
      name,
      from: range,
      to: newRange,
      area,
      files: Array.from(files),
    });
    bumpsByArea.set(area, bumps);
  }
}

/* ------------------------------------------------------------------ */
/* Reporting                                                           */
/* ------------------------------------------------------------------ */

if (skipped.length > 0) {
  console.log("\nSkipped:");
  for (const note of skipped) {
    console.log(`  - ${note}`);
  }
}

const totalBumps = Array.from(bumpsByArea.values()).reduce(
  (sum, b) => sum + b.length,
  0,
);

if (totalBumps === 0) {
  console.log("\nNo bumps available.");
  process.exit(0);
}

console.log(
  `\n${totalBumps} bump(s) detected across ${bumpsByArea.size} area(s):`,
);
for (const [area, bumps] of bumpsByArea) {
  console.log(`\n[${area}]`);
  for (const b of bumps) {
    console.log(`  - ${b.name}: ${b.from} -> ${b.to}`);
  }
}

if (dryRun) {
  console.log("\n--dry-run: no files were modified.");
  process.exit(0);
}

/* ------------------------------------------------------------------ */
/* Application                                                         */
/* ------------------------------------------------------------------ */

// Mutate in-memory representations
const updatedRaws = new Map<string, string>();

for (const [, bumps] of bumpsByArea) {
  for (const bump of bumps) {
    for (const file of bump.files) {
      const loaded = loadedPkgs.get(file);
      if (!loaded) throw new Error(`Package not loaded: ${file}`);
      const currentRaw = updatedRaws.get(file) ?? loaded.raw;
      const newRaw = applyBumpToRaw(currentRaw, bump.name, bump.from, bump.to);
      updatedRaws.set(file, newRaw);
    }
  }
}

// Write back
for (const [file, raw] of updatedRaws) {
  writeFileSync(file, raw);
  console.log(
    `\nUpdated ${file.replace(`${repoRoot}\\`, "").replace(`${repoRoot}/`, "")}`,
  );
}

// Regenerate lockfile
console.log("\nRefreshing bun.lock...");
const installResult = spawnSync("bun", ["install"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(installResult.status ?? 1);
