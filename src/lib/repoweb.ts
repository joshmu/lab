import { formatSize } from "./github";

export function parseGitHubPath(segments: string[]): {
  owner: string;
  repo: string;
  path: string;
} | null {
  if (segments.length < 3 || segments[0] !== "github.com") {
    return null;
  }
  return {
    owner: segments[1],
    repo: segments[2],
    path: segments.slice(3).join("/"),
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
