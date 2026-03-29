import { describe, it, expect } from "vitest";
import { formatSize, isFile, isDirectory, GitHubApiError } from "./github";
import type { GitHubFile, GitHubDirEntry } from "./github";

describe("formatSize", () => {
  it("formats bytes", () => {
    expect(formatSize(0)).toBe("0b");
    expect(formatSize(512)).toBe("512b");
    expect(formatSize(1023)).toBe("1023b");
  });

  it("formats kilobytes", () => {
    expect(formatSize(1024)).toBe("1.0kb");
    expect(formatSize(2560)).toBe("2.5kb");
  });

  it("formats megabytes", () => {
    expect(formatSize(1024 * 1024)).toBe("1.0mb");
    expect(formatSize(5.5 * 1024 * 1024)).toBe("5.5mb");
  });
});

describe("isFile", () => {
  it("returns true for file responses", () => {
    const file: GitHubFile = {
      type: "file",
      name: "index.ts",
      path: "src/index.ts",
      size: 100,
      content: "",
      encoding: "base64",
      download_url: null,
    };
    expect(isFile(file)).toBe(true);
  });

  it("returns false for directory responses", () => {
    const dir: GitHubDirEntry[] = [
      {
        type: "file",
        name: "a.ts",
        path: "a.ts",
        size: 10,
        download_url: null,
      },
    ];
    expect(isFile(dir)).toBe(false);
  });
});

describe("isDirectory", () => {
  it("returns true for array responses", () => {
    const dir: GitHubDirEntry[] = [
      { type: "dir", name: "src", path: "src", size: 0, download_url: null },
    ];
    expect(isDirectory(dir)).toBe(true);
  });

  it("returns false for file responses", () => {
    const file: GitHubFile = {
      type: "file",
      name: "index.ts",
      path: "src/index.ts",
      size: 100,
      content: "",
      encoding: "base64",
      download_url: null,
    };
    expect(isDirectory(file)).toBe(false);
  });
});

describe("GitHubApiError", () => {
  it("stores status and message", () => {
    const error = new GitHubApiError(404, "Not found");
    expect(error.status).toBe(404);
    expect(error.message).toBe("Not found");
    expect(error.name).toBe("GitHubApiError");
  });
});
