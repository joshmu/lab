import {
  fetchContents,
  fetchRepoInfo,
  isFile,
  isDirectory,
  GitHubApiError,
} from "@/lib/github";
import { parseGitHubPath, renderDirectory } from "@/lib/repoweb";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
};

function textResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", ...CACHE_HEADERS },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const { path: segments } = await params;
  const parsed = parseGitHubPath(segments);

  if (!parsed) {
    return textResponse(
      "Error: Invalid URL format\nExpected: /repoweb/github.com/{owner}/{repo}/{path}",
      400
    );
  }

  const { owner, repo, path } = parsed;

  try {
    const contents = await fetchContents(owner, repo, path);

    if (isDirectory(contents)) {
      let description: string | null = null;
      if (!path) {
        try {
          const repoInfo = await fetchRepoInfo(owner, repo);
          description = repoInfo.description;
        } catch {
          // Non-critical, skip description
        }
      }
      return textResponse(
        renderDirectory(owner, repo, path, contents, description)
      );
    }

    if (isFile(contents)) {
      const decoded = Buffer.from(contents.content, "base64").toString("utf-8");
      return textResponse(decoded);
    }

    return textResponse("Error: Unexpected response from GitHub", 500);
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return textResponse(
        `Error (${error.status}): ${error.message}`,
        error.status
      );
    }
    throw error;
  }
}
