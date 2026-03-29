import { formatSize } from "./github";

export function parseRepoPath(segments: string[]): {
  owner: string;
  repo: string;
  path: string;
} | null {
  // Skip leading "github.com" if present for backwards compatibility
  const start = segments[0] === "github.com" ? 1 : 0;
  const rest = segments.slice(start);
  if (rest.length < 2) {
    return null;
  }
  return {
    owner: rest[0],
    repo: rest[1],
    path: rest.slice(2).join("/"),
  };
}

export function renderDirectory(
  owner: string,
  repo: string,
  path: string,
  entries: { type: string; name: string; path: string; size: number }[],
  repoDescription: string | null
): string {
  const lines: string[] = [];

  if (!path && repoDescription) {
    lines.push(`${owner}/${repo}: ${repoDescription}`, ``);
  }

  const dirs = entries
    .filter((e) => e.type === "dir")
    .sort((a, b) => a.name.localeCompare(b.name));
  const files = entries
    .filter((e) => e.type !== "dir")
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const dir of dirs) {
    lines.push(`${dir.name}/`);
  }

  for (const file of files) {
    lines.push(`${file.name} (${formatSize(file.size)})`);
  }

  return lines.join("\n");
}
