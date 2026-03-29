import { describe, it, expect } from "vitest";
import { parseRepoPath, renderDirectory } from "@/lib/repoweb";

describe("parseRepoPath", () => {
  it("parses owner/repo paths", () => {
    expect(parseRepoPath(["owner", "repo"])).toEqual({
      owner: "owner",
      repo: "repo",
      path: "",
    });
  });

  it("parses paths with file path segments", () => {
    expect(parseRepoPath(["owner", "repo", "src", "index.ts"])).toEqual({
      owner: "owner",
      repo: "repo",
      path: "src/index.ts",
    });
  });

  it("strips leading github.com for backwards compatibility", () => {
    expect(parseRepoPath(["github.com", "owner", "repo"])).toEqual({
      owner: "owner",
      repo: "repo",
      path: "",
    });
  });

  it("returns null for too few segments", () => {
    expect(parseRepoPath(["owner"])).toBeNull();
    expect(parseRepoPath(["github.com", "owner"])).toBeNull();
  });

  it("returns null for empty segments", () => {
    expect(parseRepoPath([])).toBeNull();
  });
});

describe("renderDirectory", () => {
  const entries = [
    { type: "file", name: "README.md", path: "README.md", size: 1200 },
    { type: "dir", name: "src", path: "src", size: 0 },
    { type: "file", name: "package.json", path: "package.json", size: 482 },
    { type: "dir", name: "test", path: "test", size: 0 },
  ];

  it("lists directories first, then files, both sorted", () => {
    const result = renderDirectory("owner", "repo", "", entries, null);
    const lines = result.split("\n");
    expect(lines[0]).toBe("src/");
    expect(lines[1]).toBe("test/");
    expect(lines[2]).toBe("package.json (482b)");
    expect(lines[3]).toBe("README.md (1.2kb)");
  });

  it("includes repo description at root", () => {
    const result = renderDirectory(
      "owner",
      "repo",
      "",
      entries,
      "A cool project"
    );
    expect(result).toMatch(/^owner\/repo: A cool project/);
  });

  it("omits description for non-root paths", () => {
    const result = renderDirectory(
      "owner",
      "repo",
      "src",
      entries,
      "A cool project"
    );
    expect(result).not.toContain("A cool project");
  });

  it("omits description when null", () => {
    const result = renderDirectory("owner", "repo", "", entries, null);
    expect(result).not.toContain("owner/repo:");
  });
});
