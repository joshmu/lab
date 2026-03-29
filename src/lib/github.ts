const GITHUB_API = "https://api.github.com";
const FETCH_TIMEOUT_MS = 10_000;

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "RepoWeb-Proxy",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export interface GitHubFile {
  type: "file";
  name: string;
  path: string;
  size: number;
  content: string;
  encoding: string;
  download_url: string | null;
}

export interface GitHubDirEntry {
  type: "file" | "dir" | "symlink" | "submodule";
  name: string;
  path: string;
  size: number;
  download_url: string | null;
}

export interface GitHubRepo {
  default_branch: string;
  description: string | null;
  full_name: string;
  stargazers_count: number;
}

export type GitHubContentsResponse = GitHubFile | GitHubDirEntry[];

export class GitHubApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

export async function fetchContents(
  owner: string,
  repo: string,
  path: string = ""
): Promise<GitHubContentsResponse> {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;
  let res: Response;

  try {
    res = await fetch(url, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch {
    throw new GitHubApiError(
      502,
      `Failed to connect to GitHub API. The service may be temporarily unavailable.`
    );
  }

  if (!res.ok) {
    if (res.status === 404) {
      throw new GitHubApiError(404, `Not found: ${owner}/${repo}/${path}`);
    }
    if (res.status === 403) {
      const remaining = res.headers.get("x-ratelimit-remaining");
      if (remaining === "0") {
        throw new GitHubApiError(
          403,
          "GitHub API rate limit exceeded. Configure GITHUB_TOKEN env var for higher limits (5,000 req/hr vs 60 req/hr)."
        );
      }
      throw new GitHubApiError(403, `Forbidden: ${owner}/${repo}/${path}`);
    }
    throw new GitHubApiError(
      res.status,
      `GitHub API error (${res.status}): ${res.statusText}`
    );
  }

  return res.json();
}

export async function fetchRepoInfo(
  owner: string,
  repo: string
): Promise<GitHubRepo> {
  const url = `${GITHUB_API}/repos/${owner}/${repo}`;
  let res: Response;

  try {
    res = await fetch(url, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch {
    throw new GitHubApiError(
      502,
      `Failed to connect to GitHub API. The service may be temporarily unavailable.`
    );
  }

  if (!res.ok) {
    if (res.status === 404) {
      throw new GitHubApiError(404, `Repository not found: ${owner}/${repo}`);
    }
    throw new GitHubApiError(
      res.status,
      `GitHub API error (${res.status}): ${res.statusText}`
    );
  }

  return res.json();
}

export function isFile(
  response: GitHubContentsResponse
): response is GitHubFile {
  return !Array.isArray(response) && response.type === "file";
}

export function isDirectory(
  response: GitHubContentsResponse
): response is GitHubDirEntry[] {
  return Array.isArray(response);
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}b`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}kb`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}mb`;
}
