export type DependencyGroupId =
  | "catalog-shared"
  | "web-stack"
  | "server-data"
  | "tooling";

export type DependencyGroup = {
  id: DependencyGroupId;
  branchSlug: string;
  title: string;
  packages: string[];
};

export const dependencyGroups: DependencyGroup[] = [
  {
    id: "catalog-shared",
    branchSlug: "catalog-shared",
    title: "catalog shared",
    packages: [
      "dotenv",
      "zod",
      "@types/bun",
      "better-auth",
      "lucide-react",
      "next-themes",
      "react",
      "react-dom",
      "sonner",
      "@prisma/client",
      "@types/react",
      "@types/react-dom",
      "tailwindcss",
    ],
  },
  {
    id: "web-stack",
    branchSlug: "web-stack",
    title: "web stack",
    packages: [
      "next",
      "@tailwindcss/postcss",
      "@tanstack/react-form",
      "babel-plugin-react-compiler",
      "@types/node",
      "@base-ui/react",
      "class-variance-authority",
      "clsx",
      "shadcn",
      "tailwind-merge",
      "tw-animate-css",
    ],
  },
  {
    id: "server-data",
    branchSlug: "server-data",
    title: "server data",
    packages: [
      "hono",
      "prisma",
      "@prisma/adapter-pg",
      "pg",
      "@types/pg",
      "@t3-oss/env-core",
      "@t3-oss/env-nextjs",
    ],
  },
  {
    id: "tooling",
    branchSlug: "tooling",
    title: "tooling",
    packages: ["typescript", "@biomejs/biome", "lefthook", "tsdown"],
  },
];

export function getDependencyGroup(groupId: string): DependencyGroup {
  const group = dependencyGroups.find((candidate) => candidate.id === groupId);

  if (!group) {
    const availableGroups = dependencyGroups.map(({ id }) => id).join(", ");
    throw new Error(
      `Unknown dependency group "${groupId}". Expected one of: ${availableGroups}`,
    );
  }

  return group;
}
